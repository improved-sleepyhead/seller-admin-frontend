/* @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react"
import { type ReactElement } from "react"
import { useForm } from "react-hook-form"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  resetDraftRegistryStore,
  type AdEditFormValues
} from "@/entities/ad/model"

import { AdAiChat } from "../ad-ai-chat"

const FORM_DEFAULT_VALUES: AdEditFormValues = {
  category: "electronics",
  description: "Описание",
  params: {
    brand: "Apple",
    color: "black",
    condition: "used",
    model: "MacBook Pro",
    type: "laptop"
  },
  price: 120000,
  title: "Ноутбук"
}

interface ControlledSseResponse {
  close: () => void
  error: (reason?: unknown) => void
  push: (chunk: string) => void
  ready: Promise<void>
  response: Response
}

function createAbortError(): Error {
  const abortError = new Error("Aborted")
  abortError.name = "AbortError"

  return abortError
}

function createControlledSseResponse(): ControlledSseResponse {
  const encoder = new TextEncoder()
  let controllerRef: ReadableStreamDefaultController<Uint8Array> | null = null
  let readyResolver: (() => void) | null = null
  const ready = new Promise<void>(resolve => {
    readyResolver = resolve
  })

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controllerRef = controller
      readyResolver?.()
      readyResolver = null
    }
  })

  return {
    close: () => {
      controllerRef?.close()
    },
    error: reason => {
      controllerRef?.error(reason)
    },
    push: chunk => {
      controllerRef?.enqueue(encoder.encode(chunk))
    },
    ready,
    response: new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1"
      },
      status: 200
    })
  }
}

function toUiMessageFrame(chunk: object | "[DONE]"): string {
  if (chunk === "[DONE]") {
    return "data: [DONE]\n\n"
  }

  return `data: ${JSON.stringify(chunk)}\n\n`
}

function AdAiChatHarness(): ReactElement {
  const form = useForm<AdEditFormValues>({
    defaultValues: FORM_DEFAULT_VALUES
  })

  return <AdAiChat disabled={false} form={form} itemId={1} />
}

describe("AdAiChat", () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", fetchMock)

    window.localStorage.clear()
    window.sessionStorage.clear()
    resetDraftRegistryStore()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it("should append user message and update assistant text by streaming chunks", async () => {
    const stream = createControlledSseResponse()
    fetchMock.mockResolvedValueOnce(stream.response)

    render(<AdAiChatHarness />)

    fireEvent.change(screen.getByLabelText("Сообщение для AI чата"), {
      target: { value: "Привет" }
    })
    fireEvent.click(screen.getByRole("button", { name: "Отправить" }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    const requestInit = fetchMock.mock.calls[0]?.[1]
    const requestBody =
      typeof requestInit?.body === "string"
        ? (JSON.parse(requestInit.body) as {
            item: Record<string, unknown>
            messages: {
              parts: { text?: string; type: string }[]
              role: string
            }[]
            userMessage?: string
          })
        : null

    expect(requestBody).not.toBeNull()
    expect(requestBody?.userMessage).toBeUndefined()
    expect(requestBody?.item.title).toBe("Ноутбук")
    expect(requestBody?.messages.at(-1)).toEqual(
      expect.objectContaining({
        parts: [
          {
            text: "Привет",
            type: "text"
          }
        ],
        role: "user"
      })
    )

    await stream.ready
    stream.push(
      toUiMessageFrame({
        messageId: "assistant-1",
        type: "start"
      })
    )
    stream.push(
      toUiMessageFrame({
        id: "text-1",
        type: "text-start"
      })
    )
    stream.push(
      toUiMessageFrame({
        delta: "Част",
        id: "text-1",
        type: "text-delta"
      })
    )

    await screen.findByText("Част")
    expect(screen.getByText("Привет")).toBeDefined()
    expect(
      within(screen.getByTestId("ai-chat-message-user")).getByText("Вы")
    ).toBeDefined()

    stream.push(
      toUiMessageFrame({
        delta: "ь ответа",
        id: "text-1",
        type: "text-delta"
      })
    )
    stream.push(
      toUiMessageFrame({
        id: "text-1",
        type: "text-end"
      })
    )
    stream.push(toUiMessageFrame("[DONE]"))
    stream.close()

    await waitFor(() => {
      expect(screen.getByText("Часть ответа")).toBeDefined()
    })
  })

  it("should stop streaming on cancel and keep partial assistant message", async () => {
    const stream = createControlledSseResponse()

    fetchMock.mockImplementationOnce((_, init) => {
      init?.signal?.addEventListener(
        "abort",
        () => {
          stream.error(createAbortError())
        },
        { once: true }
      )

      return Promise.resolve(stream.response)
    })

    render(<AdAiChatHarness />)

    fireEvent.change(screen.getByLabelText("Сообщение для AI чата"), {
      target: { value: "Отмени" }
    })
    fireEvent.click(screen.getByRole("button", { name: "Отправить" }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    await stream.ready
    stream.push(
      toUiMessageFrame({
        messageId: "assistant-1",
        type: "start"
      })
    )
    stream.push(
      toUiMessageFrame({
        id: "text-1",
        type: "text-start"
      })
    )
    stream.push(
      toUiMessageFrame({
        delta: "Частичный",
        id: "text-1",
        type: "text-delta"
      })
    )

    await screen.findByText("Частичный")

    fireEvent.click(screen.getByRole("button", { name: "Отменить" }))

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Отменить" })).toBeNull()
    })

    expect(screen.getByText("Частичный")).toBeDefined()
  })

  it("should show inline error and retry last message", async () => {
    const secondStream = createControlledSseResponse()

    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: "AI_PROVIDER_ERROR",
            message: "Временная ошибка",
            success: false
          }),
          {
            headers: {
              "Content-Type": "application/json"
            },
            status: 502
          }
        )
      )
      .mockResolvedValueOnce(secondStream.response)

    render(<AdAiChatHarness />)

    fireEvent.change(screen.getByLabelText("Сообщение для AI чата"), {
      target: { value: "Повтори" }
    })
    fireEvent.click(screen.getByRole("button", { name: "Отправить" }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    const errorContainer = await screen.findByTestId("ai-chat-error")
    expect(within(errorContainer).getByText("Временная ошибка")).toBeDefined()

    fireEvent.click(screen.getByRole("button", { name: "Повторить" }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    await secondStream.ready
    secondStream.push(
      toUiMessageFrame({
        messageId: "assistant-2",
        type: "start"
      })
    )
    secondStream.push(
      toUiMessageFrame({
        id: "text-2",
        type: "text-start"
      })
    )
    secondStream.push(
      toUiMessageFrame({
        delta: "Ответ после ",
        id: "text-2",
        type: "text-delta"
      })
    )
    secondStream.push(
      toUiMessageFrame({
        delta: "повтора",
        id: "text-2",
        type: "text-delta"
      })
    )
    secondStream.push(
      toUiMessageFrame({
        id: "text-2",
        type: "text-end"
      })
    )
    secondStream.push(toUiMessageFrame("[DONE]"))
    secondStream.close()

    await screen.findByText("Ответ после повтора")

    expect(screen.getAllByTestId("ai-chat-message-user")).toHaveLength(1)
  })
})

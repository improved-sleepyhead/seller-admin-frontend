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

import type { AdEditFormValues } from "@/entities/ad"
import { draftRegistryStore } from "@/shared/lib/draft-registry-store"

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
        "Content-Type": "text/event-stream"
      },
      status: 200
    })
  }
}

function toSseFrame(eventName: string, data: object): string {
  return `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`
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
    draftRegistryStore.setState({ drafts: {} })
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

    await stream.ready
    stream.push(toSseFrame("chunk", { content: "Част" }))

    await screen.findByText("Част")
    expect(screen.getByText("Привет")).toBeDefined()

    stream.push(toSseFrame("chunk", { content: "ь ответа" }))
    stream.push(toSseFrame("done", { model: "test-model" }))
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
    stream.push(toSseFrame("chunk", { content: "Частичный" }))

    await screen.findByText("Частичный")

    fireEvent.click(screen.getByRole("button", { name: "Отменить" }))

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Отменить" })).toBeNull()
    })

    expect(screen.getByText("Частичный")).toBeDefined()
    expect(screen.queryByText("Печатает...")).toBeNull()
  })

  it("should show inline error and retry last message", async () => {
    const firstStream = createControlledSseResponse()
    const secondStream = createControlledSseResponse()

    fetchMock
      .mockResolvedValueOnce(firstStream.response)
      .mockResolvedValueOnce(secondStream.response)

    render(<AdAiChatHarness />)

    fireEvent.change(screen.getByLabelText("Сообщение для AI чата"), {
      target: { value: "Повтори" }
    })
    fireEvent.click(screen.getByRole("button", { name: "Отправить" }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    await firstStream.ready
    firstStream.push(
      toSseFrame("error", {
        message: "Временная ошибка",
        success: false
      })
    )
    firstStream.close()

    const errorContainer = await screen.findByTestId("ai-chat-error")
    expect(within(errorContainer).getByText("Временная ошибка")).toBeDefined()

    fireEvent.click(screen.getByRole("button", { name: "Повторить" }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    await secondStream.ready
    secondStream.push(toSseFrame("chunk", { content: "Ответ после " }))
    secondStream.push(toSseFrame("chunk", { content: "повтора" }))
    secondStream.push(toSseFrame("done", { model: "test-model" }))
    secondStream.close()

    await screen.findByText("Ответ после повтора")

    expect(screen.getAllByTestId("ai-chat-message-user")).toHaveLength(1)
  })
})

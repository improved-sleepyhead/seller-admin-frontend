/* @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react"
import { useForm } from "react-hook-form"
import { type ReactElement } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { AdEditFormValues } from "@/entities/ad"
import { draftRegistryStore } from "@/shared/lib/draft-registry-store"

import type {
  AiChatStreamResult,
  StreamAiChatOptions
} from "../../model/ai-chat.transport.types"
import { streamAiChat } from "../../model/ai-chat.transport"
import { AdAiChat } from "../ad-ai-chat"

vi.mock("../../model/ai-chat.transport", () => ({
  streamAiChat: vi.fn()
}))

const streamAiChatMock = vi.mocked(streamAiChat)

interface Deferred<T> {
  promise: Promise<T>
  reject: (reason?: unknown) => void
  resolve: (value: T | PromiseLike<T>) => void
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve
    reject = innerReject
  })

  return {
    promise,
    reject,
    resolve
  }
}

function createAbortError(): Error {
  const abortError = new Error("Aborted")
  abortError.name = "AbortError"

  return abortError
}

function createStreamResult(content: string): AiChatStreamResult {
  return {
    message: {
      content,
      role: "assistant"
    }
  }
}

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

function AdAiChatHarness(): ReactElement {
  const form = useForm<AdEditFormValues>({
    defaultValues: FORM_DEFAULT_VALUES
  })

  return <AdAiChat disabled={false} form={form} itemId={1} />
}

describe("AdAiChat", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    window.sessionStorage.clear()
    draftRegistryStore.setState({ drafts: {} })
  })

  afterEach(() => {
    cleanup()
  })

  it("should append user message and update assistant text by streaming chunks", async () => {
    const secondChunkGate = createDeferred<void>()

    streamAiChatMock.mockImplementation(
      async ({ onChunk, onDone }: StreamAiChatOptions) => {
        onChunk?.("Част", "Част")
        await secondChunkGate.promise
        onChunk?.("ь ответа", "Часть ответа")

        const result = createStreamResult("Часть ответа")
        onDone?.(result)

        return result
      }
    )

    render(<AdAiChatHarness />)

    fireEvent.change(screen.getByLabelText("Сообщение для AI чата"), {
      target: { value: "Привет" }
    })
    fireEvent.click(screen.getByRole("button", { name: "Отправить" }))

    await screen.findByText("Привет")

    await waitFor(() => {
      expect(screen.getByText("Част")).toBeDefined()
    })

    secondChunkGate.resolve()

    await waitFor(() => {
      expect(screen.getByText("Часть ответа")).toBeDefined()
    })

    expect(streamAiChatMock).toHaveBeenCalledTimes(1)
    expect(streamAiChatMock.mock.calls[0]?.[0].userMessage).toBe("Привет")
  })

  it("should stop streaming on cancel and keep partial assistant message", async () => {
    streamAiChatMock.mockImplementation(
      async ({ onChunk, signal }: StreamAiChatOptions) => {
        onChunk?.("Частичный", "Частичный")

        await new Promise((_, reject) => {
          signal.addEventListener(
            "abort",
            () => {
              reject(createAbortError())
            },
            { once: true }
          )
        })

        return createStreamResult("")
      }
    )

    render(<AdAiChatHarness />)

    fireEvent.change(screen.getByLabelText("Сообщение для AI чата"), {
      target: { value: "Отмени" }
    })
    fireEvent.click(screen.getByRole("button", { name: "Отправить" }))

    await screen.findByText("Частичный")

    fireEvent.click(screen.getByRole("button", { name: "Отменить" }))

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Отменить" })).toBeNull()
    })

    expect(screen.getByText("Частичный")).toBeDefined()
    expect(screen.queryByText("Печатает...")).toBeNull()
  })

  it("should show inline error and retry last message", async () => {
    streamAiChatMock
      .mockImplementationOnce(async () => {
        throw new Error("Временная ошибка")
      })
      .mockImplementationOnce(async ({ onDone }: StreamAiChatOptions) => {
        const result = createStreamResult("Ответ после повтора")
        onDone?.(result)

        return result
      })

    render(<AdAiChatHarness />)

    fireEvent.change(screen.getByLabelText("Сообщение для AI чата"), {
      target: { value: "Повтори" }
    })
    fireEvent.click(screen.getByRole("button", { name: "Отправить" }))

    const errorContainer = await screen.findByTestId("ai-chat-error")
    expect(within(errorContainer).getByText("Временная ошибка")).toBeDefined()

    fireEvent.click(screen.getByRole("button", { name: "Повторить" }))

    await waitFor(() => {
      expect(streamAiChatMock).toHaveBeenCalledTimes(2)
    })

    await screen.findByText("Ответ после повтора")

    const userMessages = screen.getAllByTestId("ai-chat-message-user")
    expect(userMessages).toHaveLength(1)
    expect(streamAiChatMock.mock.calls[1]?.[0].userMessage).toBe("Повтори")
  })
})

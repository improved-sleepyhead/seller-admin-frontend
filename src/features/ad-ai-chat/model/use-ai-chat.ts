import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  ensureValidAiPayload,
  type AdEditFormApi,
  type AiChatMessage,
  type AiChatRequest
} from "@/entities/ad"
import { isAppApiError } from "@/shared/api/error"

import { readAdAiChatHistory, saveAdAiChatHistory } from "./ai-chat-history"
import { isAbortError } from "./ai-chat.transport-errors"
import { streamAiChat } from "./ai-chat.transport"

interface UseAiChatOptions {
  disabled: boolean
  form: AdEditFormApi | null
  itemId: number
}

interface RetryContext {
  requestMessages: AiChatRequest["messages"]
  userMessage: string
}

interface StartStreamOptions {
  appendUserMessage: boolean
  itemPayload: AiChatRequest["item"]
  requestMessages: AiChatRequest["messages"]
  userMessage: string
}

interface UseAiChatResult {
  canRetry: boolean
  canSubmit: boolean
  cancelStreaming: () => void
  inlineError: string | null
  inputValue: string
  isPending: boolean
  messages: AiChatMessage[]
  retryLastMessage: () => Promise<void>
  sendMessage: () => Promise<void>
  setInputValue: (nextValue: string) => void
}

function createChatMessageId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    "randomUUID" in globalThis.crypto
  ) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function toRequestMessages(
  messages: AiChatMessage[]
): AiChatRequest["messages"] {
  return messages.flatMap(message => {
    if (
      message.status !== "done" ||
      (message.role !== "user" && message.role !== "assistant")
    ) {
      return []
    }

    const content = message.content.trim()

    if (content.length === 0) {
      return []
    }

    return [{ content, role: message.role }]
  })
}

function getChatErrorMessage(error: unknown): string {
  if (isAppApiError(error)) {
    return error.message
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message
  }

  return "Не удалось получить ответ AI-чата."
}

function patchMessageById(
  messages: AiChatMessage[],
  messageId: string,
  patch: Partial<AiChatMessage>
): AiChatMessage[] {
  return messages.map(message =>
    message.id === messageId ? { ...message, ...patch } : message
  )
}

function finalizeAbortedMessage(
  messages: AiChatMessage[],
  messageId: string
): AiChatMessage[] {
  const message = messages.find(entry => entry.id === messageId)

  if (!message) {
    return messages
  }

  if (message.content.trim().length === 0) {
    return messages.filter(entry => entry.id !== messageId)
  }

  return patchMessageById(messages, messageId, { status: "done" })
}

export function useAiChat({
  disabled,
  form,
  itemId
}: UseAiChatOptions): UseAiChatResult {
  const [inputValue, setInputValue] = useState("")
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [messages, setMessages] = useState<AiChatMessage[]>(() =>
    readAdAiChatHistory(itemId)
  )
  const [retryContext, setRetryContext] = useState<RetryContext | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const activeRequestIdRef = useRef(0)
  const savedItemIdRef = useRef(itemId)

  useEffect(() => {
    activeRequestIdRef.current += 1

    if (abortControllerRef.current !== null) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    setInputValue("")
    setInlineError(null)
    setIsPending(false)
    setRetryContext(null)
    setMessages(readAdAiChatHistory(itemId))
  }, [itemId])

  useEffect(() => {
    if (savedItemIdRef.current !== itemId) {
      savedItemIdRef.current = itemId
      return
    }

    saveAdAiChatHistory(itemId, messages)
  }, [itemId, messages])

  useEffect(() => {
    return () => {
      activeRequestIdRef.current += 1

      if (abortControllerRef.current !== null) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

  const startStream = useCallback(
    async ({
      appendUserMessage,
      itemPayload,
      requestMessages,
      userMessage
    }: StartStreamOptions): Promise<void> => {
      const userMessageId = createChatMessageId()
      const assistantMessageId = createChatMessageId()
      const requestId = activeRequestIdRef.current + 1
      const now = new Date().toISOString()
      const requestAbortController = new AbortController()

      activeRequestIdRef.current = requestId
      abortControllerRef.current = requestAbortController
      setIsPending(true)
      setInlineError(null)

      setMessages(previousMessages => {
        const baseMessages = appendUserMessage
          ? [
              ...previousMessages,
              {
                content: userMessage,
                createdAt: now,
                id: userMessageId,
                role: "user",
                status: "done"
              } satisfies AiChatMessage
            ]
          : previousMessages

        return [
          ...baseMessages,
          {
            content: "",
            createdAt: now,
            id: assistantMessageId,
            role: "assistant",
            status: "streaming"
          } satisfies AiChatMessage
        ]
      })

      try {
        await streamAiChat({
          item: itemPayload,
          messages: requestMessages,
          onChunk: (_chunk, aggregatedText) => {
            if (activeRequestIdRef.current !== requestId) {
              return
            }

            setMessages(previousMessages =>
              patchMessageById(previousMessages, assistantMessageId, {
                content: aggregatedText,
                status: "streaming"
              })
            )
          },
          onDone: result => {
            if (activeRequestIdRef.current !== requestId) {
              return
            }

            setMessages(previousMessages =>
              patchMessageById(previousMessages, assistantMessageId, {
                content: result.message.content,
                status: "done"
              })
            )
          },
          signal: requestAbortController.signal,
          userMessage
        })

        if (activeRequestIdRef.current !== requestId) {
          return
        }

        setRetryContext(null)
      } catch (error) {
        if (activeRequestIdRef.current !== requestId) {
          return
        }

        if (isAbortError(error)) {
          setMessages(previousMessages =>
            finalizeAbortedMessage(previousMessages, assistantMessageId)
          )
          return
        }

        setMessages(previousMessages =>
          patchMessageById(previousMessages, assistantMessageId, {
            content: getChatErrorMessage(error),
            status: "error"
          })
        )
        setInlineError(getChatErrorMessage(error))
        setRetryContext({
          requestMessages,
          userMessage
        })
      } finally {
        if (activeRequestIdRef.current !== requestId) {
          return
        }

        if (abortControllerRef.current === requestAbortController) {
          abortControllerRef.current = null
        }

        setIsPending(false)
      }
    },
    []
  )

  const validatePayload = useCallback(async () => {
    if (disabled || form === null || isPending) {
      return null
    }

    const validationResult = await ensureValidAiPayload(form)

    if (!validationResult.isValid) {
      setInlineError("Заполните обязательные поля перед отправкой сообщения.")
      return null
    }

    return validationResult.payload
  }, [disabled, form, isPending])

  const sendMessage = useCallback(async () => {
    const userMessage = inputValue.trim()

    if (userMessage.length === 0) {
      return
    }

    const itemPayload = await validatePayload()

    if (itemPayload === null) {
      return
    }

    const requestMessages = toRequestMessages(messages)

    setInputValue("")
    setRetryContext(null)

    await startStream({
      appendUserMessage: true,
      itemPayload,
      requestMessages,
      userMessage
    })
  }, [inputValue, messages, startStream, validatePayload])

  const retryLastMessage = useCallback(async () => {
    if (retryContext === null || isPending) {
      return
    }

    const itemPayload = await validatePayload()

    if (itemPayload === null) {
      return
    }

    await startStream({
      appendUserMessage: false,
      itemPayload,
      requestMessages: retryContext.requestMessages,
      userMessage: retryContext.userMessage
    })
  }, [isPending, retryContext, startStream, validatePayload])

  const cancelStreaming = useCallback(() => {
    if (abortControllerRef.current === null) {
      return
    }

    abortControllerRef.current.abort()
  }, [])

  const canSubmit = useMemo(
    () => !disabled && form !== null && !isPending && inputValue.trim().length > 0,
    [disabled, form, inputValue, isPending]
  )

  return {
    canRetry: retryContext !== null && !isPending,
    canSubmit,
    cancelStreaming,
    inlineError,
    inputValue,
    isPending,
    messages,
    retryLastMessage,
    sendMessage,
    setInputValue
  }
}

export type { UseAiChatResult }

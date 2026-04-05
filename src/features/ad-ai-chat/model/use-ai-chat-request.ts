import { useCallback, useEffect, useRef, useState } from "react"

import type { AiChatRequest } from "@/entities/ad/api"
import type { AiChatMessage } from "@/entities/ad/model"
import { isAppApiError } from "@/shared/api/error"

import { streamAiChat } from "./ai-chat.transport"
import { isAbortError } from "./ai-chat.transport-errors"

import type { Dispatch, SetStateAction } from "react"

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

interface UseAiChatRequestOptions {
  itemId: number
  setMessages: Dispatch<SetStateAction<AiChatMessage[]>>
}

interface UseAiChatRequestResult {
  cancelStreaming: () => void
  inlineError: string | null
  isPending: boolean
  retryContext: RetryContext | null
  setInlineError: Dispatch<SetStateAction<string | null>>
  startStream: (options: StartStreamOptions) => Promise<void>
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

export function useAiChatRequest({
  itemId,
  setMessages
}: UseAiChatRequestOptions): UseAiChatRequestResult {
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [retryContext, setRetryContext] = useState<RetryContext | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const activeRequestIdRef = useRef(0)

  useEffect(() => {
    activeRequestIdRef.current += 1

    if (abortControllerRef.current !== null) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    setInlineError(null)
    setIsPending(false)
    setRetryContext(null)
  }, [itemId])

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
      setInlineError(null)
      setIsPending(true)
      setRetryContext(null)

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
        if (activeRequestIdRef.current === requestId) {
          if (abortControllerRef.current === requestAbortController) {
            abortControllerRef.current = null
          }

          setIsPending(false)
        }
      }
    },
    [setMessages]
  )

  const cancelStreaming = useCallback(() => {
    if (abortControllerRef.current === null) {
      return
    }

    abortControllerRef.current.abort()
  }, [])

  return {
    cancelStreaming,
    inlineError,
    isPending,
    retryContext,
    setInlineError,
    startStream
  }
}

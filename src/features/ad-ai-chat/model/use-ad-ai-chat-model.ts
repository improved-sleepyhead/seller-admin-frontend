import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type ChatStatus, type UIMessage } from "ai"
import { useCallback, useEffect, useMemo, useState } from "react"

import { ensureValidAiPayload, type AdEditFormApi } from "@/entities/ad/model"
import { getApiBaseUrl } from "@/shared/config/runtime-config"

import { useAiChatHistory } from "./use-ai-chat-history"

interface UseAdAiChatModelOptions {
  disabled: boolean
  form: AdEditFormApi | null
  itemId: number
}

interface UseAdAiChatModelResult {
  canRetry: boolean
  canSubmit: boolean
  clearInlineError: () => void
  inlineError: string | null
  inputValue: string
  isPending: boolean
  messages: UIMessage[]
  retryLastMessage: () => Promise<void>
  sendMessage: (nextMessage?: string) => Promise<void>
  setInputValue: (nextValue: string) => void
  status: ChatStatus
  stopStreaming: () => void
}

const AI_CHAT_TRANSPORT = new DefaultChatTransport<UIMessage>({
  api: new URL("/api/ai/chat", getApiBaseUrl()).toString()
})
const REQUIRED_AI_FIELDS_MESSAGE =
  "Заполните обязательные поля перед отправкой сообщения."
const FALLBACK_CHAT_ERROR_MESSAGE = "Не удалось получить ответ AI-чата."

function parseChatErrorMessage(error: Error | undefined): string | null {
  if (!error) {
    return null
  }

  if (error.message.length === 0) {
    return FALLBACK_CHAT_ERROR_MESSAGE
  }

  try {
    const parsedError = JSON.parse(error.message) as { message?: unknown }

    if (typeof parsedError.message === "string") {
      return parsedError.message
    }
  } catch {
    // Keep the raw error message when the transport returned plain text.
  }

  return error.message
}

function hasRetryTarget(messages: UIMessage[]): boolean {
  return messages.some(message => message.role === "user")
}

export function useAdAiChatModel({
  disabled,
  form,
  itemId
}: UseAdAiChatModelOptions): UseAdAiChatModelResult {
  const [inputValue, setInputValue] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const { initialMessages, saveMessages } = useAiChatHistory(itemId)
  const {
    clearError,
    error,
    messages,
    regenerate,
    sendMessage: submitChatMessage,
    status,
    stop
  } = useChat<UIMessage>({
    id: `ad-ai-chat-${itemId}`,
    messages: initialMessages,
    transport: AI_CHAT_TRANSPORT
  })

  useEffect(() => {
    saveMessages(messages)
  }, [messages, saveMessages])

  useEffect(() => {
    setInputValue("")
    setValidationError(null)
  }, [itemId])

  const isPending = status === "streaming" || status === "submitted"
  const inlineError = validationError ?? parseChatErrorMessage(error)

  const clearInlineError = useCallback(() => {
    setValidationError(null)
    clearError()
  }, [clearError])

  const validatePayload = useCallback(async () => {
    if (disabled || form === null || isPending) {
      return null
    }

    const validationResult = await ensureValidAiPayload(form)

    if (!validationResult.isValid) {
      clearError()
      setValidationError(REQUIRED_AI_FIELDS_MESSAGE)
      return null
    }

    clearError()
    setValidationError(null)
    return validationResult.payload
  }, [clearError, disabled, form, isPending])

  const sendMessage = useCallback(
    async (nextMessage?: string) => {
      const trimmedMessage = (nextMessage ?? inputValue).trim()

      if (trimmedMessage.length === 0) {
        return
      }

      const itemPayload = await validatePayload()

      if (itemPayload === null) {
        return
      }

      setInputValue("")

      await submitChatMessage(
        { text: trimmedMessage },
        {
          body: {
            item: itemPayload
          }
        }
      )
    },
    [inputValue, submitChatMessage, validatePayload]
  )

  const retryLastMessage = useCallback(async () => {
    if (isPending || !hasRetryTarget(messages)) {
      return
    }

    const itemPayload = await validatePayload()

    if (itemPayload === null) {
      return
    }

    await regenerate({
      body: {
        item: itemPayload
      }
    })
  }, [isPending, messages, regenerate, validatePayload])

  const canSubmit = useMemo(
    () =>
      !disabled && form !== null && !isPending && inputValue.trim().length > 0,
    [disabled, form, inputValue, isPending]
  )
  const canRetry = useMemo(
    () =>
      inlineError !== null &&
      !disabled &&
      form !== null &&
      !isPending &&
      hasRetryTarget(messages),
    [disabled, form, inlineError, isPending, messages]
  )

  return {
    canRetry,
    canSubmit,
    clearInlineError,
    inlineError,
    inputValue,
    isPending,
    messages,
    retryLastMessage,
    sendMessage,
    setInputValue,
    status,
    stopStreaming: () => {
      void stop()
    }
  }
}

export type { UseAdAiChatModelResult }

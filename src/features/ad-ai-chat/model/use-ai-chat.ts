import { useCallback, useMemo, useState } from "react"

import type { AiChatRequest } from "@/entities/ad/api"
import {
  ensureValidAiPayload,
  type AdEditFormApi,
  type AiChatMessage
} from "@/entities/ad/model"

import { useAiChatHistory } from "./use-ai-chat-history"
import { useAiChatRequest } from "./use-ai-chat-request"

interface UseAiChatOptions {
  disabled: boolean
  form: AdEditFormApi | null
  itemId: number
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

export function useAiChat({
  disabled,
  form,
  itemId
}: UseAiChatOptions): UseAiChatResult {
  const [inputValue, setInputValue] = useState("")
  const { messages, setMessages } = useAiChatHistory(itemId)
  const {
    cancelStreaming,
    inlineError,
    isPending,
    retryContext,
    setInlineError,
    startStream
  } = useAiChatRequest({
    itemId,
    setMessages
  })

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
  }, [disabled, form, isPending, setInlineError])

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
  const canSubmit = useMemo(
    () =>
      !disabled && form !== null && !isPending && inputValue.trim().length > 0,
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

import { useCallback, useMemo } from "react"

import { readAdAiChatHistory, saveAdAiChatHistory } from "./ai-chat-history"

import type { UIMessage } from "ai"

interface UseAiChatHistoryResult {
  initialMessages: UIMessage[]
  saveMessages: (messages: UIMessage[]) => void
}

export function useAiChatHistory(itemId: number): UseAiChatHistoryResult {
  const initialMessages = useMemo(() => readAdAiChatHistory(itemId), [itemId])
  const saveMessages = useCallback(
    (messages: UIMessage[]) => {
      saveAdAiChatHistory(itemId, messages)
    },
    [itemId]
  )

  return {
    initialMessages,
    saveMessages
  }
}

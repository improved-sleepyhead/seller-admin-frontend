import { useEffect, useRef, useState } from "react"

import type { AiChatMessage } from "@/entities/ad/model"

import { readAdAiChatHistory, saveAdAiChatHistory } from "./ai-chat-history"

import type { Dispatch, SetStateAction } from "react"

interface UseAiChatHistoryResult {
  messages: AiChatMessage[]
  setMessages: Dispatch<SetStateAction<AiChatMessage[]>>
}

export function useAiChatHistory(itemId: number): UseAiChatHistoryResult {
  const [messages, setMessages] = useState<AiChatMessage[]>(() =>
    readAdAiChatHistory(itemId)
  )
  const savedItemIdRef = useRef(itemId)

  useEffect(() => {
    setMessages(readAdAiChatHistory(itemId))
  }, [itemId])

  useEffect(() => {
    if (savedItemIdRef.current !== itemId) {
      savedItemIdRef.current = itemId
      return
    }

    saveAdAiChatHistory(itemId, messages)
  }, [itemId, messages])

  return {
    messages,
    setMessages
  }
}

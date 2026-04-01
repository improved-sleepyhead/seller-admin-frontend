import { z } from "zod/v4"

import type { AiChatMessage } from "@/entities/ad/model"
import { draftRegistryStore } from "@/shared/lib/draft-registry-store"

const AI_CHAT_STORAGE_KEY_PREFIX = "ad-ai-chat:v1:"
const LEGACY_AI_CHAT_STORAGE_KEY_PREFIX = "ad-ai-chat:"

const AiChatMessageSchema: z.ZodType<AiChatMessage> = z.object({
  content: z.string(),
  createdAt: z.string().datetime(),
  id: z.string().min(1),
  role: z.enum(["assistant", "system", "user"]),
  status: z.enum(["done", "streaming", "error"])
})

const StoredAiChatHistorySchema = z.object({
  itemId: z.number().int().positive(),
  messages: z.array(AiChatMessageSchema),
  updatedAt: z.string().datetime()
})

function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined"
}

function toStorageKey(itemId: number): string {
  return `${AI_CHAT_STORAGE_KEY_PREFIX}${itemId}`
}

function toLegacyStorageKey(itemId: number): string {
  return `${LEGACY_AI_CHAT_STORAGE_KEY_PREFIX}${itemId}`
}

function normalizeStreamingMessage(message: AiChatMessage): AiChatMessage {
  if (message.status !== "streaming") {
    return message
  }

  return {
    ...message,
    content:
      message.content.trim().length > 0
        ? message.content
        : "Генерация была прервана.",
    status: "error"
  }
}

function syncChatMetadata(itemId: number, hasChatHistory: boolean): void {
  const draftMeta = draftRegistryStore.getState().drafts[itemId]
  const hasDraft = draftMeta?.hasDraft ?? false

  if (hasChatHistory) {
    draftRegistryStore.getState().upsertDraftMeta(itemId, {
      hasChatHistory: true,
      hasDraft,
      updatedAt: new Date().toISOString()
    })

    return
  }

  if (!hasDraft) {
    draftRegistryStore.getState().clearDraftMeta(itemId)
    return
  }

  draftRegistryStore.getState().upsertDraftMeta(itemId, {
    hasChatHistory: false,
    hasDraft: true,
    updatedAt: new Date().toISOString()
  })
}

function parseStoredHistory(
  rawPayload: string | null,
  itemId: number
): AiChatMessage[] | null {
  if (rawPayload === null) {
    return null
  }

  try {
    const parsedPayload = JSON.parse(rawPayload) as unknown
    const parsedHistory = StoredAiChatHistorySchema.safeParse(parsedPayload)

    if (!parsedHistory.success) {
      return null
    }

    if (parsedHistory.data.itemId !== itemId) {
      return null
    }

    return parsedHistory.data.messages.map(normalizeStreamingMessage)
  } catch {
    return null
  }
}

export function getAdAiChatStorageKey(itemId: number): string {
  return toStorageKey(itemId)
}

export function getLegacyAdAiChatStorageKey(itemId: number): string {
  return toLegacyStorageKey(itemId)
}

export function readAdAiChatHistory(itemId: number): AiChatMessage[] {
  if (!isBrowserEnvironment()) {
    return []
  }

  const storageKey = toStorageKey(itemId)
  const legacyStorageKey = toLegacyStorageKey(itemId)
  const currentHistory = parseStoredHistory(
    window.localStorage.getItem(storageKey),
    itemId
  )

  if (currentHistory !== null) {
    syncChatMetadata(itemId, currentHistory.length > 0)
    return currentHistory
  }

  const legacyHistory = parseStoredHistory(
    window.localStorage.getItem(legacyStorageKey),
    itemId
  )

  if (legacyHistory === null) {
    syncChatMetadata(itemId, false)
    return []
  }

  saveAdAiChatHistory(itemId, legacyHistory)
  window.localStorage.removeItem(legacyStorageKey)

  return legacyHistory
}

export function saveAdAiChatHistory(
  itemId: number,
  messages: AiChatMessage[]
): void {
  if (!isBrowserEnvironment()) {
    return
  }

  const storageKey = toStorageKey(itemId)
  const legacyStorageKey = toLegacyStorageKey(itemId)

  if (messages.length === 0) {
    window.localStorage.removeItem(storageKey)
    window.localStorage.removeItem(legacyStorageKey)
    syncChatMetadata(itemId, false)
    return
  }

  const normalizedMessages = messages.map(normalizeStreamingMessage)
  const payload = {
    itemId,
    messages: normalizedMessages,
    updatedAt: new Date().toISOString()
  }

  window.localStorage.setItem(storageKey, JSON.stringify(payload))
  window.localStorage.removeItem(legacyStorageKey)
  syncChatMetadata(itemId, true)
}

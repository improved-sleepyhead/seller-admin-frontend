import { z } from "zod/v4"

import {
  clearDraftRegistryMeta,
  getDraftRegistryMeta,
  upsertDraftRegistryMeta
} from "@/entities/ad/model"

import type { UIMessage } from "ai"

const AI_CHAT_STORAGE_KEY_PREFIX = "ad-ai-chat:v2:"

const StoredTextPartSchema = z.object({
  state: z.enum(["done", "streaming"]).optional(),
  text: z.string(),
  type: z.literal("text")
})

const StoredChatMessageSchema = z.object({
  id: z.string().min(1),
  metadata: z.unknown().optional(),
  parts: z.array(StoredTextPartSchema).min(1),
  role: z.enum(["assistant", "system", "user"])
})

const StoredAiChatHistorySchema = z.object({
  itemId: z.number().int().positive(),
  messages: z.array(StoredChatMessageSchema),
  updatedAt: z.string().datetime()
})

function isNotNull<T>(value: T | null): value is T {
  return value !== null
}

function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined"
}

function toStorageKey(itemId: number): string {
  return `${AI_CHAT_STORAGE_KEY_PREFIX}${itemId}`
}

function normalizeTextPart(
  part: z.infer<typeof StoredTextPartSchema>
): z.infer<typeof StoredTextPartSchema> {
  if (part.state !== "streaming") {
    return part
  }

  return {
    ...part,
    state: "done"
  }
}

function syncChatMetadata(itemId: number, hasChatHistory: boolean): void {
  const draftMeta = getDraftRegistryMeta(itemId)
  const hasDraft = draftMeta?.hasDraft ?? false

  if (hasChatHistory) {
    upsertDraftRegistryMeta(itemId, {
      hasChatHistory: true,
      hasDraft,
      updatedAt: new Date().toISOString()
    })

    return
  }

  if (!hasDraft) {
    clearDraftRegistryMeta(itemId)
    return
  }

  upsertDraftRegistryMeta(itemId, {
    hasChatHistory: false,
    hasDraft: true,
    updatedAt: new Date().toISOString()
  })
}

function toUiMessage(
  message: z.infer<typeof StoredChatMessageSchema>
): UIMessage | null {
  const parts = message.parts
    .map(normalizeTextPart)
    .filter(part => part.text.trim().length > 0)

  if (parts.length === 0) {
    return null
  }

  return {
    ...(message.metadata === undefined ? {} : { metadata: message.metadata }),
    id: message.id,
    parts,
    role: message.role
  }
}

function toStoredMessage(
  message: UIMessage
): z.infer<typeof StoredChatMessageSchema> | null {
  const parts = message.parts.flatMap(part => {
    if (part.type !== "text" || part.text.trim().length === 0) {
      return []
    }

    return [
      {
        ...(part.state === undefined
          ? {}
          : { state: part.state === "streaming" ? "done" : part.state }),
        text: part.text,
        type: "text" as const
      }
    ]
  })

  if (parts.length === 0) {
    return null
  }

  return {
    ...(message.metadata === undefined ? {} : { metadata: message.metadata }),
    id: message.id,
    parts,
    role: message.role
  }
}

function parseStoredHistory(
  rawPayload: string | null,
  itemId: number
): UIMessage[] | null {
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

    return parsedHistory.data.messages.map(toUiMessage).filter(isNotNull)
  } catch {
    return null
  }
}

export function getChatKey(itemId: number): string {
  return toStorageKey(itemId)
}

export function readAdAiChatHistory(itemId: number): UIMessage[] {
  if (!isBrowserEnvironment()) {
    return []
  }

  const storageKey = toStorageKey(itemId)
  const currentHistory = parseStoredHistory(
    window.localStorage.getItem(storageKey),
    itemId
  )

  if (currentHistory !== null) {
    syncChatMetadata(itemId, currentHistory.length > 0)
    return currentHistory
  }

  syncChatMetadata(itemId, false)
  return []
}

export function saveAdAiChatHistory(
  itemId: number,
  messages: UIMessage[]
): void {
  if (!isBrowserEnvironment()) {
    return
  }

  const storageKey = toStorageKey(itemId)
  const normalizedMessages = messages.map(toStoredMessage).filter(isNotNull)

  if (normalizedMessages.length === 0) {
    window.localStorage.removeItem(storageKey)
    syncChatMetadata(itemId, false)
    return
  }

  const payload = {
    itemId,
    messages: normalizedMessages,
    updatedAt: new Date().toISOString()
  }

  window.localStorage.setItem(storageKey, JSON.stringify(payload))
  syncChatMetadata(itemId, true)
}

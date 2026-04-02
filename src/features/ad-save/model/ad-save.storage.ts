import { markNextAutosaveSkip } from "@/shared/lib/draft-autosave-guard"

const DRAFT_STORAGE_KEY_PREFIX = "ad-draft:v1:"
const AI_CHAT_STORAGE_KEY_PREFIX = "ad-ai-chat:v1:"
const LEGACY_DRAFT_STORAGE_KEY_PREFIX = "ad-draft:"
const LEGACY_AI_CHAT_STORAGE_KEY_PREFIX = "ad-ai-chat:"

export function getDraftKey(itemId: number): string {
  return `${DRAFT_STORAGE_KEY_PREFIX}${itemId}`
}

export function getChatKey(itemId: number): string {
  return `${AI_CHAT_STORAGE_KEY_PREFIX}${itemId}`
}

export function clearAdDraftAndChatStorage(itemId: number) {
  if (typeof window === "undefined") {
    return
  }

  const keysToRemove = [
    getDraftKey(itemId),
    getChatKey(itemId),
    `${LEGACY_DRAFT_STORAGE_KEY_PREFIX}${itemId}`,
    `${LEGACY_AI_CHAT_STORAGE_KEY_PREFIX}${itemId}`
  ]

  for (const storageKey of keysToRemove) {
    window.localStorage.removeItem(storageKey)
  }

  markNextAutosaveSkip(itemId)
}

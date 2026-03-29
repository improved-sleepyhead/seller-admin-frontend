import type { AdDraft } from "@/entities/ad"

import { AdDraftSchema } from "./ad-draft.schema"
import { getAdDraftStorageKey, getLegacyAdDraftStorageKey } from "./draft-keys"

function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined"
}

function isDevEnvironment(): boolean {
  try {
    const env = (
      import.meta as ImportMeta & {
        env?: Record<string, unknown>
      }
    ).env

    return env?.DEV === true
  } catch {
    return false
  }
}

function warnInvalidDraftPayload(reason: string): void {
  if (!isDevEnvironment()) {
    return
  }

  console.warn(`[ad-draft] Ignored invalid draft payload: ${reason}`)
}

function parseDraftPayload(rawPayload: string | null): AdDraft | null {
  if (rawPayload === null) {
    return null
  }

  try {
    const parsedPayload = JSON.parse(rawPayload) as unknown
    const parseResult = AdDraftSchema.safeParse(parsedPayload)

    if (!parseResult.success) {
      warnInvalidDraftPayload("schema validation failed")
      return null
    }

    return parseResult.data
  } catch {
    warnInvalidDraftPayload("invalid JSON")
    return null
  }
}

export function readAdDraft(itemId: number): AdDraft | null {
  if (!isBrowserEnvironment()) {
    return null
  }

  const currentStorageKey = getAdDraftStorageKey(itemId)
  const legacyStorageKey = getLegacyAdDraftStorageKey(itemId)
  const currentDraft = parseDraftPayload(
    window.localStorage.getItem(currentStorageKey)
  )

  if (currentDraft !== null) {
    if (currentDraft.itemId === itemId) {
      return currentDraft
    }

    window.localStorage.removeItem(currentStorageKey)
    return null
  }

  const legacyDraft = parseDraftPayload(
    window.localStorage.getItem(legacyStorageKey)
  )

  if (legacyDraft === null) {
    return null
  }

  if (legacyDraft.itemId !== itemId) {
    window.localStorage.removeItem(legacyStorageKey)
    return null
  }

  window.localStorage.setItem(currentStorageKey, JSON.stringify(legacyDraft))
  window.localStorage.removeItem(legacyStorageKey)

  return legacyDraft
}

export function saveAdDraft(draft: AdDraft): void {
  if (!isBrowserEnvironment()) {
    return
  }

  window.localStorage.setItem(
    getAdDraftStorageKey(draft.itemId),
    JSON.stringify(draft)
  )
}

export function removeAdDraft(itemId: number): void {
  if (!isBrowserEnvironment()) {
    return
  }

  window.localStorage.removeItem(getAdDraftStorageKey(itemId))
  window.localStorage.removeItem(getLegacyAdDraftStorageKey(itemId))
}

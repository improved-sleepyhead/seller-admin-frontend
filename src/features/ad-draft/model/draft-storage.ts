import type { AdDraft } from "@/entities/ad/model"

import { AdDraftSchema } from "./ad-draft.schema"
import { getDraftKey } from "./draft-keys"

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

  const storageKey = getDraftKey(itemId)
  const draft = parseDraftPayload(window.localStorage.getItem(storageKey))

  if (draft !== null) {
    if (draft.itemId === itemId) {
      return draft
    }

    window.localStorage.removeItem(storageKey)
    return null
  }

  return null
}

export function saveAdDraft(draft: AdDraft): void {
  if (!isBrowserEnvironment()) {
    return
  }

  window.localStorage.setItem(getDraftKey(draft.itemId), JSON.stringify(draft))
}

export function removeAdDraft(itemId: number): void {
  if (!isBrowserEnvironment()) {
    return
  }

  window.localStorage.removeItem(getDraftKey(itemId))
}

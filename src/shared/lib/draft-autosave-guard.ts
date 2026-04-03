const SKIP_NEXT_DRAFT_AUTOSAVE_KEY_PREFIX = "ad-draft:skip-next-autosave:v1:"

function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined"
}

function getStorageKey(itemId: number): string {
  return `${SKIP_NEXT_DRAFT_AUTOSAVE_KEY_PREFIX}${itemId}`
}

export function markNextAutosaveSkip(itemId: number): void {
  if (!isBrowserEnvironment()) {
    return
  }

  window.sessionStorage.setItem(getStorageKey(itemId), "1")
}

export function consumeNextAutosaveSkip(itemId: number): boolean {
  if (!isBrowserEnvironment()) {
    return false
  }

  const storageKey = getStorageKey(itemId)
  const shouldSkip = window.sessionStorage.getItem(storageKey) === "1"

  if (!shouldSkip) {
    return false
  }

  window.sessionStorage.removeItem(storageKey)
  return true
}

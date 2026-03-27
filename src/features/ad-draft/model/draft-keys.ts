const DRAFT_STORAGE_KEY_PREFIX = "ad-draft:v1:"
const LEGACY_DRAFT_STORAGE_KEY_PREFIX = "ad-draft:"

export function getAdDraftStorageKey(itemId: number): string {
  return `${DRAFT_STORAGE_KEY_PREFIX}${itemId}`
}

export function getLegacyAdDraftStorageKey(itemId: number): string {
  return `${LEGACY_DRAFT_STORAGE_KEY_PREFIX}${itemId}`
}

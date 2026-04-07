const DRAFT_STORAGE_KEY_PREFIX = "ad-draft:"

export function getDraftKey(itemId: number): string {
  return `${DRAFT_STORAGE_KEY_PREFIX}${itemId}`
}

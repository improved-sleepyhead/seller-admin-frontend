import {
  clearDraftRegistryMeta,
  getDraftRegistryMeta,
  upsertDraftRegistryMeta
} from "@/entities/ad/model"

export function upsertAdDraftMetadata(itemId: number, savedAt: string): void {
  const existingMeta = getDraftRegistryMeta(itemId)

  upsertDraftRegistryMeta(itemId, {
    hasChatHistory: existingMeta?.hasChatHistory ?? false,
    hasDraft: true,
    updatedAt: savedAt
  })
}

export function clearAdDraftMetadata(itemId: number): void {
  const existingMeta = getDraftRegistryMeta(itemId)

  if (!existingMeta?.hasChatHistory) {
    clearDraftRegistryMeta(itemId)
    return
  }

  upsertDraftRegistryMeta(itemId, {
    hasChatHistory: true,
    hasDraft: false,
    updatedAt: new Date().toISOString()
  })
}

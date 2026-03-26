export interface DraftMeta {
  hasDraft: boolean
  hasChatHistory: boolean
  updatedAt: string
}

export interface DraftRegistryState {
  drafts: Record<number, DraftMeta>
  upsertDraftMeta: (itemId: number, meta: DraftMeta) => void
  clearDraftMeta: (itemId: number) => void
}

const drafts: DraftRegistryState["drafts"] = {}

function upsertDraftMeta(itemId: number, meta: DraftMeta) {
  drafts[itemId] = meta
}

function clearDraftMeta(itemId: number) {
  delete drafts[itemId]
}

export const draftRegistryStore: DraftRegistryState = {
  drafts,
  upsertDraftMeta,
  clearDraftMeta
}

import { createStore } from "zustand/vanilla"

export interface DraftMeta {
  hasDraft: boolean
  hasChatHistory: boolean
  updatedAt: string
}

export type DraftMetaPatch = Partial<DraftMeta>

export interface DraftRegistryState {
  drafts: Record<number, DraftMeta>
  upsertDraftMeta: (itemId: number, meta: DraftMetaPatch) => void
  clearDraftMeta: (itemId: number) => void
}

function mergeDraftMeta(
  existingMeta: DraftMeta | undefined,
  metaPatch: DraftMetaPatch
): DraftMeta {
  return {
    hasChatHistory: metaPatch.hasChatHistory ?? existingMeta?.hasChatHistory ?? false,
    hasDraft: metaPatch.hasDraft ?? existingMeta?.hasDraft ?? false,
    updatedAt: metaPatch.updatedAt ?? new Date().toISOString()
  }
}

export const draftRegistryStore = createStore<DraftRegistryState>((set, get) => ({
  clearDraftMeta: itemId => {
    const currentDrafts = get().drafts

    if (!(itemId in currentDrafts)) {
      return
    }

    const { [itemId]: _removedDraft, ...nextDrafts } = currentDrafts
    set({ drafts: nextDrafts })
  },
  drafts: {},
  upsertDraftMeta: (itemId, metaPatch) => {
    set(state => ({
      drafts: {
        ...state.drafts,
        [itemId]: mergeDraftMeta(state.drafts[itemId], metaPatch)
      }
    }))
  }
}))

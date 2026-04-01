import { createStore, type StoreApi } from "zustand"

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

type DraftRegistryStoreApi = StoreApi<DraftRegistryState>

function mergeDraftMeta(
  existingMeta: DraftMeta | undefined,
  metaPatch: DraftMetaPatch
): DraftMeta {
  return {
    hasChatHistory:
      metaPatch.hasChatHistory ?? existingMeta?.hasChatHistory ?? false,
    hasDraft: metaPatch.hasDraft ?? existingMeta?.hasDraft ?? false,
    updatedAt: metaPatch.updatedAt ?? new Date().toISOString()
  }
}

function createDraftRegistryStore(): DraftRegistryStoreApi {
  return createStore<DraftRegistryState>((set, get) => ({
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
}

const draftRegistryStore = createDraftRegistryStore()

export function getDraftRegistryMeta(itemId: number): DraftMeta | undefined {
  return draftRegistryStore.getState().drafts[itemId]
}

export function upsertDraftRegistryMeta(
  itemId: number,
  metaPatch: DraftMetaPatch
): void {
  draftRegistryStore.getState().upsertDraftMeta(itemId, metaPatch)
}

export function clearDraftRegistryMeta(itemId: number): void {
  draftRegistryStore.getState().clearDraftMeta(itemId)
}

export function resetDraftRegistryStore(): void {
  draftRegistryStore.setState({ drafts: {} })
}

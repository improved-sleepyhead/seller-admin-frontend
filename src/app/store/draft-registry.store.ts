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
const DRAFT_REGISTRY_STORE_KEY = "__SELLER_ADMIN_DRAFT_REGISTRY_STORE__"

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

const storeRegistry = globalThis as typeof globalThis & {
  [DRAFT_REGISTRY_STORE_KEY]?: DraftRegistryStoreApi
}

storeRegistry[DRAFT_REGISTRY_STORE_KEY] ??= createDraftRegistryStore()

export const draftRegistryStore = storeRegistry[DRAFT_REGISTRY_STORE_KEY]

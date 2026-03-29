import { createStore, type StoreApi, useStore } from "zustand"

import type { AdDraft } from "@/entities/ad"

interface AdDraftSessionState {
  draftSavedAt: string | null
  isRestoreDialogOpen: boolean
  pendingRestore: boolean
  restoreCandidate: AdDraft | null
}

interface AdDraftState {
  byItemId: Record<number, AdDraftSessionState>
  closeRestoreDialog: (itemId: number) => void
  markRestorePending: (itemId: number) => void
  openRestoreDialog: (itemId: number, draft: AdDraft) => void
  resetSession: (itemId: number) => void
  setDraftSavedAt: (itemId: number, savedAt: string | null) => void
}

type AdDraftStateStoreApi = StoreApi<AdDraftState>
const AD_DRAFT_STATE_STORE_KEY = "__SELLER_ADMIN_AD_DRAFT_STATE_STORE__"

const INITIAL_SESSION_STATE: AdDraftSessionState = {
  draftSavedAt: null,
  isRestoreDialogOpen: false,
  pendingRestore: false,
  restoreCandidate: null
}

function createSessionState(
  existing: AdDraftSessionState | undefined
): AdDraftSessionState {
  if (existing) {
    return existing
  }

  return { ...INITIAL_SESSION_STATE }
}

function createAdDraftStateStore(): AdDraftStateStoreApi {
  return createStore<AdDraftState>((set, get) => ({
    byItemId: {},
    closeRestoreDialog: itemId => {
      const existingSession = get().byItemId[itemId]

      if (!existingSession) {
        return
      }

      if (
        !existingSession.isRestoreDialogOpen &&
        !existingSession.restoreCandidate
      ) {
        return
      }

      set(state => ({
        byItemId: {
          ...state.byItemId,
          [itemId]: {
            ...createSessionState(state.byItemId[itemId]),
            isRestoreDialogOpen: false,
            pendingRestore: false,
            restoreCandidate: null
          }
        }
      }))
    },
    markRestorePending: itemId => {
      const existingSession = get().byItemId[itemId]

      if (!existingSession?.restoreCandidate) {
        return
      }

      if (existingSession.pendingRestore) {
        return
      }

      set(state => ({
        byItemId: {
          ...state.byItemId,
          [itemId]: {
            ...createSessionState(state.byItemId[itemId]),
            pendingRestore: true
          }
        }
      }))
    },
    openRestoreDialog: (itemId, draft) => {
      set(state => ({
        byItemId: {
          ...state.byItemId,
          [itemId]: {
            ...createSessionState(state.byItemId[itemId]),
            isRestoreDialogOpen: true,
            pendingRestore: false,
            restoreCandidate: draft
          }
        }
      }))
    },
    resetSession: itemId => {
      const existingSession = get().byItemId[itemId]

      if (!existingSession) {
        return
      }

      const { [itemId]: _removedSession, ...nextSessions } = get().byItemId
      set({ byItemId: nextSessions })
    },
    setDraftSavedAt: (itemId, savedAt) => {
      const existingSession = get().byItemId[itemId]

      if (existingSession?.draftSavedAt === savedAt) {
        return
      }

      set(state => ({
        byItemId: {
          ...state.byItemId,
          [itemId]: {
            ...createSessionState(state.byItemId[itemId]),
            draftSavedAt: savedAt
          }
        }
      }))
    }
  }))
}

const storeRegistry = globalThis as typeof globalThis & {
  [AD_DRAFT_STATE_STORE_KEY]?: AdDraftStateStoreApi
}

storeRegistry[AD_DRAFT_STATE_STORE_KEY] ??= createAdDraftStateStore()

export const adDraftStateStore = storeRegistry[AD_DRAFT_STATE_STORE_KEY]

export function useAdDraftSessionSelector<Selected>(
  itemId: number,
  selector: (session: AdDraftSessionState) => Selected
): Selected {
  return useStore(adDraftStateStore, state =>
    selector(state.byItemId[itemId] ?? INITIAL_SESSION_STATE)
  )
}

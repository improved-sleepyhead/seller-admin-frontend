import { createStore, type StoreApi, useStore } from "zustand"

import type { AdDraft } from "@/entities/ad/model"

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

const adDraftStateStore = createAdDraftStateStore()

export function useAdDraftSessionSelector<Selected>(
  itemId: number,
  selector: (session: AdDraftSessionState) => Selected
): Selected {
  return useStore(adDraftStateStore, state =>
    selector(state.byItemId[itemId] ?? INITIAL_SESSION_STATE)
  )
}

export function closeAdDraftRestoreDialog(itemId: number): void {
  adDraftStateStore.getState().closeRestoreDialog(itemId)
}

export function markAdDraftRestorePending(itemId: number): void {
  adDraftStateStore.getState().markRestorePending(itemId)
}

export function openAdDraftRestoreDialog(itemId: number, draft: AdDraft): void {
  adDraftStateStore.getState().openRestoreDialog(itemId, draft)
}

export function resetAdDraftSession(itemId: number): void {
  adDraftStateStore.getState().resetSession(itemId)
}

export function setAdDraftSavedAt(
  itemId: number,
  savedAt: string | null
): void {
  adDraftStateStore.getState().setDraftSavedAt(itemId, savedAt)
}

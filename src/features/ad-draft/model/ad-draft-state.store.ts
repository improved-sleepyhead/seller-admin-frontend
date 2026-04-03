import { createStore, type StoreApi, useStore } from "zustand"

import type { AdDraft } from "@/entities/ad/model"

interface SessionState {
  draftSavedAt: string | null
  isRestoreDialogOpen: boolean
  pendingRestore: boolean
  restoreCandidate: AdDraft | null
}

interface State {
  byItemId: Record<number, SessionState>
  closeRestoreDialog: (itemId: number) => void
  markRestorePending: (itemId: number) => void
  openRestoreDialog: (itemId: number, draft: AdDraft) => void
  resetSession: (itemId: number) => void
  setDraftSavedAt: (itemId: number, savedAt: string | null) => void
}

type StateStore = StoreApi<State>

const INITIAL_SESSION: SessionState = {
  draftSavedAt: null,
  isRestoreDialogOpen: false,
  pendingRestore: false,
  restoreCandidate: null
}

function getSessionState(existing: SessionState | undefined): SessionState {
  if (existing) {
    return existing
  }

  return { ...INITIAL_SESSION }
}

function createStateStore(): StateStore {
  return createStore<State>((set, get) => ({
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
            ...getSessionState(state.byItemId[itemId]),
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
            ...getSessionState(state.byItemId[itemId]),
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
            ...getSessionState(state.byItemId[itemId]),
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
            ...getSessionState(state.byItemId[itemId]),
            draftSavedAt: savedAt
          }
        }
      }))
    }
  }))
}

// Draft session state is module-scoped on purpose: it coordinates restore
// dialogs and transient UI state only for the current SPA lifetime.
const stateStore = createStateStore()

export function useDraftSession<Selected>(
  itemId: number,
  selector: (session: SessionState) => Selected
): Selected {
  return useStore(stateStore, state =>
    selector(state.byItemId[itemId] ?? INITIAL_SESSION)
  )
}

export function closeRestoreDialog(itemId: number): void {
  stateStore.getState().closeRestoreDialog(itemId)
}

export function markRestorePending(itemId: number): void {
  stateStore.getState().markRestorePending(itemId)
}

export function openRestoreDialog(itemId: number, draft: AdDraft): void {
  stateStore.getState().openRestoreDialog(itemId, draft)
}

export function resetSession(itemId: number): void {
  stateStore.getState().resetSession(itemId)
}

export function setDraftSavedAt(itemId: number, savedAt: string | null): void {
  stateStore.getState().setDraftSavedAt(itemId, savedAt)
}

import { useCallback, useEffect } from "react"

import type { AdDraft } from "@/entities/ad/model"

import { clearAdDraftMetadata } from "./ad-draft-metadata"
import {
  closeAdDraftRestoreDialog,
  markAdDraftRestorePending,
  openAdDraftRestoreDialog,
  resetAdDraftSession,
  setAdDraftSavedAt,
  useAdDraftSessionSelector
} from "./ad-draft-state.store"
import { isDraftDifferentFromServer } from "./draft-comparator"
import { readAdDraft, removeAdDraft } from "./draft-storage"

import type {
  AdDraftServerState,
  UseAdDraftOptions,
  UseAdDraftResult
} from "./ad-draft.types"

interface UseAdDraftRestoreOptions
  extends
    Pick<UseAdDraftOptions, "entryRevision" | "form" | "itemId">,
    AdDraftServerState {}

function applyRestoreCandidate(
  form: NonNullable<UseAdDraftOptions["form"]>,
  itemId: number,
  restoreCandidate: AdDraft
): void {
  form.reset(restoreCandidate.form)
  setAdDraftSavedAt(itemId, restoreCandidate.savedAt)
  closeAdDraftRestoreDialog(itemId)
}

export function useAdDraftRestore({
  entryRevision,
  form,
  itemId,
  serverHash,
  serverSnapshot
}: UseAdDraftRestoreOptions): UseAdDraftResult {
  const draftSavedAt = useAdDraftSessionSelector(
    itemId,
    session => session.draftSavedAt
  )
  const isRestoreDialogOpen = useAdDraftSessionSelector(
    itemId,
    session => session.isRestoreDialogOpen
  )
  const pendingRestore = useAdDraftSessionSelector(
    itemId,
    session => session.pendingRestore
  )
  const restoreCandidate = useAdDraftSessionSelector(
    itemId,
    session => session.restoreCandidate
  )

  useEffect(() => {
    if (serverHash === null || serverSnapshot === null) {
      return
    }

    const draft = readAdDraft(itemId)

    if (draft === null) {
      resetAdDraftSession(itemId)
      return
    }

    setAdDraftSavedAt(itemId, draft.savedAt)

    if (!isDraftDifferentFromServer(draft.form, serverSnapshot)) {
      return
    }

    openAdDraftRestoreDialog(itemId, draft)
  }, [entryRevision, itemId, serverHash, serverSnapshot])

  const restoreDraft = useCallback(() => {
    if (restoreCandidate === null) {
      return
    }

    if (form === null) {
      markAdDraftRestorePending(itemId)
      return
    }

    applyRestoreCandidate(form, itemId, restoreCandidate)
  }, [form, itemId, restoreCandidate])

  useEffect(() => {
    if (form === null || !pendingRestore || restoreCandidate === null) {
      return
    }

    applyRestoreCandidate(form, itemId, restoreCandidate)
  }, [form, itemId, pendingRestore, restoreCandidate])

  const useServerVersion = useCallback(() => {
    removeAdDraft(itemId)
    clearAdDraftMetadata(itemId)
    resetAdDraftSession(itemId)
  }, [itemId])

  return {
    draftSavedAt,
    isRestoreDialogOpen,
    restoreDraft,
    useServerVersion
  }
}

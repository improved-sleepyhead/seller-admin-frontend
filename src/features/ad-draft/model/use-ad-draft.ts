import { debounce } from "lodash"
import { useCallback, useEffect, useMemo } from "react"

import type { AdDetailsDto } from "@/entities/ad/api"
import type { AdEditFormValues } from "@/entities/ad/model"
import { consumeSkipNextDraftAutosave } from "@/shared/lib/draft-autosave-guard"
import { draftRegistryStore } from "@/shared/lib/draft-registry-store"

import {
  adDraftStateStore,
  useAdDraftSessionSelector
} from "./ad-draft-state.store"
import {
  createServerFormSnapshotFromAd,
  createServerHashFromAd,
  isDraftDifferentFromServer
} from "./draft-comparator"
import { readAdDraft, removeAdDraft, saveAdDraft } from "./draft-storage"

import type { UseFormReturn } from "react-hook-form"

const AUTOSAVE_DEBOUNCE_MS = 700

type AdEditFormApi = UseFormReturn<AdEditFormValues, unknown, AdEditFormValues>

interface UseAdDraftOptions {
  ad: AdDetailsDto | null
  entryRevision: number
  form: AdEditFormApi | null
  itemId: number
}

interface UseAdDraftResult {
  draftSavedAt: string | null
  isRestoreDialogOpen: boolean
  restoreDraft: () => void
  useServerVersion: () => void
}

function cloneDraftValues(values: AdEditFormValues): AdEditFormValues {
  return JSON.parse(JSON.stringify(values)) as AdEditFormValues
}

function upsertDraftMetadata(itemId: number, savedAt: string) {
  const existingMeta = draftRegistryStore.getState().drafts[itemId]

  draftRegistryStore.getState().upsertDraftMeta(itemId, {
    hasChatHistory: existingMeta?.hasChatHistory ?? false,
    hasDraft: true,
    updatedAt: savedAt
  })
}

function clearDraftMetadata(itemId: number) {
  const existingMeta = draftRegistryStore.getState().drafts[itemId]

  if (!existingMeta?.hasChatHistory) {
    draftRegistryStore.getState().clearDraftMeta(itemId)
    return
  }

  draftRegistryStore.getState().upsertDraftMeta(itemId, {
    hasChatHistory: true,
    hasDraft: false,
    updatedAt: new Date().toISOString()
  })
}

export function useAdDraft({
  ad,
  entryRevision,
  form,
  itemId
}: UseAdDraftOptions): UseAdDraftResult {
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

  const serverHash = useMemo(() => {
    if (ad === null) {
      return null
    }

    return createServerHashFromAd(ad)
  }, [ad])
  const serverSnapshot = useMemo(() => {
    if (ad === null) {
      return null
    }

    return createServerFormSnapshotFromAd(ad)
  }, [ad])

  useEffect(() => {
    if (ad === null || serverHash === null || serverSnapshot === null) {
      return
    }

    const draft = readAdDraft(itemId)

    if (draft === null) {
      adDraftStateStore.getState().resetSession(itemId)
      return
    }

    adDraftStateStore.getState().setDraftSavedAt(itemId, draft.savedAt)

    if (!isDraftDifferentFromServer(draft.form, serverSnapshot)) {
      return
    }

    adDraftStateStore.getState().openRestoreDialog(itemId, draft)
  }, [ad, entryRevision, itemId, serverHash, serverSnapshot])

  useEffect(() => {
    if (
      ad === null ||
      form === null ||
      serverHash === null ||
      serverSnapshot === null
    ) {
      return
    }

    const persistDraft = (values: AdEditFormValues) => {
      if (consumeSkipNextDraftAutosave(itemId)) {
        removeAdDraft(itemId)
        clearDraftMetadata(itemId)
        adDraftStateStore.getState().setDraftSavedAt(itemId, null)
        return
      }

      if (!isDraftDifferentFromServer(values, serverSnapshot)) {
        removeAdDraft(itemId)
        clearDraftMetadata(itemId)
        adDraftStateStore.getState().setDraftSavedAt(itemId, null)
        return
      }

      const savedAt = new Date().toISOString()

      saveAdDraft({
        form: cloneDraftValues(values),
        itemId,
        savedAt,
        serverHash
      })
      upsertDraftMetadata(itemId, savedAt)
      adDraftStateStore.getState().setDraftSavedAt(itemId, savedAt)
    }

    const debouncedSave = debounce((values: AdEditFormValues) => {
      persistDraft(values)
    }, AUTOSAVE_DEBOUNCE_MS)

    const valuesSubscription = form.watch((_currentValues, watchMeta) => {
      if (!watchMeta.name) {
        return
      }

      debouncedSave(form.getValues())
    })

    const handleBeforeUnload = () => {
      debouncedSave(form.getValues())
      debouncedSave.flush()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      debouncedSave.flush()
      debouncedSave.cancel()
      valuesSubscription.unsubscribe()
    }
  }, [ad, form, itemId, serverHash, serverSnapshot])

  const restoreDraft = useCallback(() => {
    if (restoreCandidate === null) {
      return
    }

    if (form === null) {
      adDraftStateStore.getState().markRestorePending(itemId)
      return
    }

    form.reset(restoreCandidate.form)
    adDraftStateStore
      .getState()
      .setDraftSavedAt(itemId, restoreCandidate.savedAt)
    adDraftStateStore.getState().closeRestoreDialog(itemId)
  }, [form, itemId, restoreCandidate])

  useEffect(() => {
    if (form === null || !pendingRestore || restoreCandidate === null) {
      return
    }

    form.reset(restoreCandidate.form)
    adDraftStateStore
      .getState()
      .setDraftSavedAt(itemId, restoreCandidate.savedAt)
    adDraftStateStore.getState().closeRestoreDialog(itemId)
  }, [form, itemId, pendingRestore, restoreCandidate])

  const useServerVersion = useCallback(() => {
    removeAdDraft(itemId)
    clearDraftMetadata(itemId)
    adDraftStateStore.getState().resetSession(itemId)
  }, [itemId])

  return {
    draftSavedAt,
    isRestoreDialogOpen,
    restoreDraft,
    useServerVersion
  }
}

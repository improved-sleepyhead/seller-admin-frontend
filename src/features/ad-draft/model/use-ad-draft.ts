import { debounce } from "lodash"
import { useCallback, useEffect, useMemo, useRef } from "react"

import type { AdDetailsDto, AdEditFormValues } from "@/entities/ad"
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
  form,
  itemId
}: UseAdDraftOptions): UseAdDraftResult {
  const lastRestoreCheckKeyRef = useRef<string | null>(null)
  const draftSavedAt = useAdDraftSessionSelector(
    itemId,
    session => session.draftSavedAt
  )
  const isRestoreDialogOpen = useAdDraftSessionSelector(
    itemId,
    session => session.isRestoreDialogOpen
  )

  const serverHash = useMemo(() => {
    if (ad === null) {
      return null
    }

    return createServerHashFromAd(ad)
  }, [ad])

  useEffect(() => {
    lastRestoreCheckKeyRef.current = null
  }, [itemId])

  useEffect(() => {
    if (ad === null || serverHash === null) {
      return
    }

    const draft = readAdDraft(itemId)

    if (draft === null) {
      adDraftStateStore.getState().resetSession(itemId)
      return
    }

    adDraftStateStore.getState().setDraftSavedAt(itemId, draft.savedAt)

    const restoreCheckKey = `${itemId}:${serverHash}:${draft.savedAt}`

    if (lastRestoreCheckKeyRef.current === restoreCheckKey) {
      return
    }

    lastRestoreCheckKeyRef.current = restoreCheckKey

    if (
      !isDraftDifferentFromServer(
        draft.form,
        createServerFormSnapshotFromAd(ad)
      )
    ) {
      return
    }

    adDraftStateStore.getState().openRestoreDialog(itemId, draft)
  }, [ad, itemId, serverHash])

  useEffect(() => {
    if (ad === null || form === null || serverHash === null) {
      return
    }

    const persistDraft = (values: AdEditFormValues) => {
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
  }, [ad, form, itemId, serverHash])

  const restoreDraft = useCallback(() => {
    if (form === null) {
      return
    }

    const restoreCandidate =
      adDraftStateStore.getState().byItemId[itemId]?.restoreCandidate ?? null

    if (restoreCandidate === null) {
      return
    }

    form.reset(restoreCandidate.form)
    adDraftStateStore
      .getState()
      .setDraftSavedAt(itemId, restoreCandidate.savedAt)
    adDraftStateStore.getState().closeRestoreDialog(itemId)
  }, [form, itemId])

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

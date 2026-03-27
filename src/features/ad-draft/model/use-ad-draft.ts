import { debounce } from "lodash"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type { AdDetailsDto, AdDraft, AdEditFormValues } from "@/entities/ad"
import { draftRegistryStore } from "@/shared/lib/draft-registry-store"

import {
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
  const existingMeta = draftRegistryStore.drafts[itemId]

  draftRegistryStore.upsertDraftMeta(itemId, {
    hasChatHistory: existingMeta?.hasChatHistory ?? false,
    hasDraft: true,
    updatedAt: savedAt
  })
}

function clearDraftMetadata(itemId: number) {
  const existingMeta = draftRegistryStore.drafts[itemId]

  if (!existingMeta?.hasChatHistory) {
    draftRegistryStore.clearDraftMeta(itemId)
    return
  }

  draftRegistryStore.upsertDraftMeta(itemId, {
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
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
  const [restoreCandidate, setRestoreCandidate] = useState<AdDraft | null>(null)
  const lastRestoreCheckKeyRef = useRef<string | null>(null)

  const serverHash = useMemo(() => {
    if (ad === null) {
      return null
    }

    return createServerHashFromAd(ad)
  }, [ad])

  useEffect(() => {
    setDraftSavedAt(null)
    setIsRestoreDialogOpen(false)
    setRestoreCandidate(null)
    lastRestoreCheckKeyRef.current = null
  }, [itemId])

  useEffect(() => {
    if (ad === null || form === null || serverHash === null) {
      return
    }

    const restoreCheckKey = `${itemId}:${serverHash}`

    if (lastRestoreCheckKeyRef.current === restoreCheckKey) {
      return
    }

    lastRestoreCheckKeyRef.current = restoreCheckKey

    const draft = readAdDraft(itemId)

    if (draft === null) {
      return
    }

    setDraftSavedAt(draft.savedAt)

    if (!isDraftDifferentFromServer(draft.form, form.getValues())) {
      return
    }

    setRestoreCandidate(draft)
    setIsRestoreDialogOpen(true)
  }, [ad, form, itemId, serverHash])

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
      setDraftSavedAt(savedAt)
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
    if (form === null || restoreCandidate === null) {
      return
    }

    form.reset(restoreCandidate.form)
    setDraftSavedAt(restoreCandidate.savedAt)
    setIsRestoreDialogOpen(false)
    setRestoreCandidate(null)
  }, [form, restoreCandidate])

  const useServerVersion = useCallback(() => {
    removeAdDraft(itemId)
    clearDraftMetadata(itemId)
    setDraftSavedAt(null)
    setIsRestoreDialogOpen(false)
    setRestoreCandidate(null)
  }, [itemId])

  return {
    draftSavedAt,
    isRestoreDialogOpen,
    restoreDraft,
    useServerVersion
  }
}

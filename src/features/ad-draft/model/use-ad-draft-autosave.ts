import debounce from "lodash-es/debounce"
import { useEffect } from "react"

import type { AdEditFormValues } from "@/entities/ad/model"
import { consumeNextAutosaveSkip } from "@/shared/lib/draft-autosave-guard"

import { setDraftSavedAt } from "./ad-draft-state.store"
import { isDraftDifferentFromServer } from "./draft-comparator"
import { removeAdDraft, saveAdDraft } from "./draft-storage"

import type { AdDraftServerState, UseAdDraftOptions } from "./ad-draft.types"

const AUTOSAVE_DEBOUNCE_MS = 700

interface Options
  extends Pick<UseAdDraftOptions, "form" | "itemId">, AdDraftServerState {}

function cloneDraftValues(values: AdEditFormValues): AdEditFormValues {
  return JSON.parse(JSON.stringify(values)) as AdEditFormValues
}

export function useAdDraftAutosave({
  form,
  itemId,
  serverHash,
  serverSnapshot
}: Options): void {
  useEffect(() => {
    if (form === null || serverHash === null || serverSnapshot === null) {
      return
    }

    const persistDraft = () => {
      const values = form.getValues()

      if (consumeNextAutosaveSkip(itemId)) {
        removeAdDraft(itemId)
        setDraftSavedAt(itemId, null)
        return
      }

      if (!isDraftDifferentFromServer(values, serverSnapshot)) {
        removeAdDraft(itemId)
        setDraftSavedAt(itemId, null)
        return
      }

      const savedAt = new Date().toISOString()

      saveAdDraft({
        form: cloneDraftValues(values),
        itemId,
        savedAt,
        serverHash
      })
      setDraftSavedAt(itemId, savedAt)
    }

    const debouncedSave = debounce(persistDraft, AUTOSAVE_DEBOUNCE_MS)

    const valuesSubscription = form.watch((_currentValues, watchMeta) => {
      if (!watchMeta.name) {
        return
      }

      debouncedSave()
    })

    const handleBeforeUnload = () => {
      debouncedSave()
      debouncedSave.flush()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      debouncedSave.flush()
      debouncedSave.cancel()
      valuesSubscription.unsubscribe()
    }
  }, [form, itemId, serverHash, serverSnapshot])
}

import { useAdDraftAutosave } from "./use-ad-draft-autosave"
import { useAdDraftRestore } from "./use-ad-draft-restore"
import { useAdDraftServerState } from "./use-ad-draft-server-state"

import type { UseAdDraftOptions, UseAdDraftResult } from "./ad-draft.types"

export function useAdDraft({
  ad,
  entryRevision,
  form,
  itemId
}: UseAdDraftOptions): UseAdDraftResult {
  const serverState = useAdDraftServerState(ad)
  const restoreState = useAdDraftRestore({
    entryRevision,
    form,
    itemId,
    ...serverState
  })

  useAdDraftAutosave({
    form,
    itemId,
    ...serverState
  })

  return restoreState
}

import type { AdDetailsDto } from "@/entities/ad/api"
import type { AdEditFormValues } from "@/entities/ad/model"

import type { UseFormReturn } from "react-hook-form"

export type AdEditFormApi = UseFormReturn<
  AdEditFormValues,
  unknown,
  AdEditFormValues
>

export interface AdDraftServerState {
  serverHash: string | null
  serverSnapshot: AdEditFormValues | null
}

export interface UseAdDraftOptions {
  ad: AdDetailsDto | null
  entryRevision: number
  form: AdEditFormApi | null
  itemId: number
}

export interface UseAdDraftResult {
  draftSavedAt: string | null
  isRestoreDialogOpen: boolean
  restoreDraft: () => void
  useServerVersion: () => void
}

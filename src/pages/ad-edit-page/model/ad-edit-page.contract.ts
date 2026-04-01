import type { AdDetailsDto } from "@/entities/ad/api"
import type {
  AdEditFormValues,
  AdsListNavigationState
} from "@/entities/ad/model"
import type { useCategoryChangeConfirm } from "@/features/ad-category-change"
import type { useAdDraft } from "@/features/ad-draft"

import type { UseFormReturn } from "react-hook-form"

export type AdEditPageFormApi = UseFormReturn<
  AdEditFormValues,
  unknown,
  AdEditFormValues
>

export type AdEditAiBadgeVariant = "default" | "destructive" | "secondary"

export interface AdEditPageAiState {
  badgeVariant: AdEditAiBadgeVariant
  chatEnabled: boolean
  descriptionEnabled: boolean
  label: string
  message: string
  model: string
  priceEnabled: boolean
}

export interface AdEditPageLoadingState {
  backHref: string
  state: "loading"
}

export interface AdEditPageNotFoundState {
  backHref: string
  state: "not-found"
}

export interface AdEditPageErrorState {
  backHref: string
  message?: string
  onRetry: () => void
  state: "error"
}

export interface AdEditPageReadyState {
  ad: AdDetailsDto
  adId: number
  ai: AdEditPageAiState
  backHref: string
  categoryChange: ReturnType<typeof useCategoryChangeConfirm>
  draft: ReturnType<typeof useAdDraft>
  editForm: AdEditPageFormApi | null
  navigationState?: AdsListNavigationState
  onFormReady: (form: AdEditPageFormApi | null) => void
  onSubmit: (values: AdEditFormValues) => Promise<void>
  savePending: boolean
  state: "ready"
}

export type AdEditPageModel =
  | AdEditPageLoadingState
  | AdEditPageNotFoundState
  | AdEditPageErrorState
  | AdEditPageReadyState

export type AdEditPageScreenState =
  | AdEditPageLoadingState
  | AdEditPageNotFoundState
  | AdEditPageErrorState

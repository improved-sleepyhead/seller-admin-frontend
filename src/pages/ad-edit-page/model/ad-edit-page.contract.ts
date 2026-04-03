import type { AdDetailsDto } from "@/entities/ad/api"
import type {
  AdEditFormValues,
  AdsListNavigationState
} from "@/entities/ad/model"

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

export interface AdEditPageCategoryChangeRequest {
  nextCategory: AdEditFormValues["category"]
  onConfirm: () => void
}

export interface AdEditFormSectionProps {
  ad: AdDetailsDto
  draftSavedAt: string | null
  onCategoryChangeRequest: (request: AdEditPageCategoryChangeRequest) => void
  onFormReady: (form: AdEditPageFormApi | null) => void
  onSubmit: (values: AdEditFormValues) => Promise<void>
  savePending: boolean
}

export interface AdEditAiToolsSectionProps {
  adId: number
  ai: AdEditPageAiState
  form: AdEditPageFormApi | null
}

export interface AdEditFooterActionsProps {
  adId: number
  navigationState?: AdsListNavigationState
  savePending: boolean
}

export interface AdEditCategoryChangeDialogProps {
  nextCategory: AdEditFormValues["category"] | null
  onCancel: () => void
  onConfirm: () => void
  open: boolean
}

export interface AdEditDraftRestoreDialogProps {
  onRestoreDraft: () => void
  onUseServerVersion: () => void
  open: boolean
}

export interface AdEditPageDialogs {
  categoryChange: AdEditCategoryChangeDialogProps
  draftRestore: AdEditDraftRestoreDialogProps
}

export interface AdEditPageReadyState {
  aiSection: AdEditAiToolsSectionProps
  dialogs: AdEditPageDialogs
  footerSection: AdEditFooterActionsProps
  formSection: AdEditFormSectionProps
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

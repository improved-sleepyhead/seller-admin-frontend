import type { AdDetailsDto } from "@/entities/ad/api"
import type {
  AdEditFormValues,
  AdsListNavigationState
} from "@/entities/ad/model"

import type { UseFormReturn } from "react-hook-form"

export type FormApi = UseFormReturn<AdEditFormValues, unknown, AdEditFormValues>

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

export interface CategoryChangeRequest {
  nextCategory: AdEditFormValues["category"]
  onConfirm: () => void
}

export interface FormSectionProps {
  ad: AdDetailsDto
  ai: AdEditPageAiState
  draftSavedAt: string | null
  form: FormApi | null
  onCategoryChangeRequest: (request: CategoryChangeRequest) => void
  onFormReady: (form: FormApi | null) => void
  onSubmit: (values: AdEditFormValues) => Promise<void>
  savePending: boolean
}

export interface AiToolsSectionProps {
  adId: number
  ai: AdEditPageAiState
  form: FormApi | null
}

export interface FooterActionsProps {
  adId: number
  navigationState?: AdsListNavigationState
  savePending: boolean
}

export interface CategoryChangeDialogProps {
  nextCategory: AdEditFormValues["category"] | null
  onCancel: () => void
  onConfirm: () => void
  open: boolean
}

export interface DraftRestoreDialogProps {
  onRestoreDraft: () => void
  onUseServerVersion: () => void
  open: boolean
}

export interface AdEditPageDialogs {
  categoryChange: CategoryChangeDialogProps
  draftRestore: DraftRestoreDialogProps
}

export interface AdEditPageReadyState {
  aiSection: AiToolsSectionProps
  dialogs: AdEditPageDialogs
  footerSection: FooterActionsProps
  formSection: FormSectionProps
  state: "ready"
}

export type AdEditPageModel =
  | AdEditPageLoadingState
  | AdEditPageNotFoundState
  | AdEditPageErrorState
  | AdEditPageReadyState

export type ScreenState =
  | AdEditPageLoadingState
  | AdEditPageNotFoundState
  | AdEditPageErrorState

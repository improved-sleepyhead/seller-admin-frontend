import type { AdDetailsVM } from "@/entities/ad/api"
import type { AdsListNavigationState } from "@/entities/ad/model"

export interface AdViewPageLoadingState {
  backHref: string
  state: "loading"
}

export interface AdViewPageNotFoundState {
  backHref: string
  state: "not-found"
}

export interface AdViewPageErrorState {
  backHref: string
  message?: string
  onRetry: () => void
  state: "error"
}

export interface AdViewPageReadyState {
  ad: AdDetailsVM
  backHref: string
  editHref: string
  editState?: AdsListNavigationState
  state: "ready"
}

export type AdViewPageModel =
  | AdViewPageLoadingState
  | AdViewPageNotFoundState
  | AdViewPageErrorState
  | AdViewPageReadyState

export type AdViewPageScreenState =
  | AdViewPageLoadingState
  | AdViewPageNotFoundState
  | AdViewPageErrorState

import type { AdsLayout, AdsListItemVM } from "@/entities/ad/api"
import type { AdsListNavigationState } from "@/entities/ad/model"

export interface AdsListPageLoadingState {
  state: "loading"
}

export interface AdsListPageErrorState {
  message?: string
  onRetry: () => void
  state: "error"
}

export interface AdsListPageEmptyState {
  state: "empty"
}

export interface AdsListPageReadyState {
  ads: AdsListItemVM[]
  state: "ready"
}

export type AdsListPageCatalogState =
  | AdsListPageLoadingState
  | AdsListPageErrorState
  | AdsListPageEmptyState
  | AdsListPageReadyState

export interface AdsListPageModel {
  catalog: AdsListPageCatalogState
  isRefreshing: boolean
  layout: AdsLayout
  navigationState: AdsListNavigationState
  total: number
}

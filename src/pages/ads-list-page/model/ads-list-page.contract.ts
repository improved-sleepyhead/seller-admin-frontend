import type { AdsLayout, AdsListItemVM } from "@/entities/ad/api"

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
  total: number
}

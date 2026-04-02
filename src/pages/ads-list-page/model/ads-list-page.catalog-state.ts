import type { AdsListItemVM } from "@/entities/ad/api"
import { isAppApiError } from "@/shared/api/error"

import type { AdsListPageCatalogState } from "./ads-list-page.contract"

interface AdsListPageCatalogStateParams {
  data: { items: AdsListItemVM[] } | undefined
  error: unknown
  isError: boolean
  isHydrated: boolean
  isPending: boolean
  onRetry: () => void
}

export function getAdsListPageCatalogState({
  data,
  error,
  isError,
  isHydrated,
  isPending,
  onRetry
}: AdsListPageCatalogStateParams): AdsListPageCatalogState {
  if (!isHydrated || (isPending && data === undefined)) {
    return {
      state: "loading"
    }
  }

  if (isError) {
    return {
      message: isAppApiError(error) ? error.message : undefined,
      onRetry,
      state: "error"
    }
  }

  if (data === undefined || data.items.length === 0) {
    return {
      state: "empty"
    }
  }

  return {
    ads: data.items,
    state: "ready"
  }
}

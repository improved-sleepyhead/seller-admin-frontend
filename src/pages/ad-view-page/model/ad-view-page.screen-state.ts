import type { AdDetailsVM } from "@/entities/ad/api"
import { isAppApiError } from "@/shared/api/error"

import type { AdViewPageScreenState } from "./ad-view-page.contract"

interface AdViewPageScreenStateParams {
  ad: AdDetailsVM | undefined
  adId: number | null
  backHref: string
  error: unknown
  isError: boolean
  isPending: boolean
  onRetry: () => void
}

export function getAdViewPageScreenState({
  ad,
  adId,
  backHref,
  error,
  isError,
  isPending,
  onRetry
}: AdViewPageScreenStateParams): AdViewPageScreenState | null {
  if (adId === null) {
    return {
      backHref,
      state: "not-found"
    }
  }

  if (isPending) {
    return {
      backHref,
      state: "loading"
    }
  }

  if (isError) {
    if (isAppApiError(error) && error.code === "NOT_FOUND") {
      return {
        backHref,
        state: "not-found"
      }
    }

    return {
      backHref,
      message: isAppApiError(error) ? error.message : undefined,
      onRetry,
      state: "error"
    }
  }

  if (ad === undefined) {
    return {
      backHref,
      state: "loading"
    }
  }

  return null
}

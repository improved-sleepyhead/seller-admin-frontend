import type { AdDetailsDto } from "@/entities/ad/api"
import { isAppApiError } from "@/shared/api/error"

import type { ScreenState } from "./ad-edit-page.contract"
import type { UseQueryResult } from "@tanstack/react-query"

export function getScreenState(
  adId: number | null,
  backHref: string,
  detailQuery: UseQueryResult<AdDetailsDto>
): ScreenState | null {
  if (adId === null) {
    return {
      backHref,
      state: "not-found"
    }
  }

  if (detailQuery.isPending) {
    return {
      backHref,
      state: "loading"
    }
  }

  if (!detailQuery.isError) {
    return null
  }

  if (
    isAppApiError(detailQuery.error) &&
    detailQuery.error.code === "NOT_FOUND"
  ) {
    return {
      backHref,
      state: "not-found"
    }
  }

  return {
    backHref,
    message: isAppApiError(detailQuery.error)
      ? detailQuery.error.message
      : undefined,
    onRetry: () => {
      void detailQuery.refetch()
    },
    state: "error"
  }
}

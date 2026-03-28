import { useQuery } from "@tanstack/react-query"
import { useLocation, useParams } from "react-router-dom"

import { adDetailQuery } from "@/entities/ad"
import { isAppApiError } from "@/shared/api/error"
import {
  AdViewErrorState,
  AdViewLayout,
  AdViewLayoutSkeleton,
  AdViewNotFoundState
} from "@/widgets/ad-view-layout"

const ADS_LIST_PATH = "/ads"

function parseAdId(rawId: string | undefined): number | null {
  if (!rawId) {
    return null
  }

  const parsedId = Number(rawId)

  if (!Number.isInteger(parsedId) || parsedId < 1) {
    return null
  }

  return parsedId
}

function buildAdEditPath(adId: number): string {
  return `/ads/${adId}/edit`
}

function resolveBackHref(state: unknown): string {
  if (
    typeof state === "object" &&
    state !== null &&
    "adsSearch" in state &&
    typeof state.adsSearch === "string"
  ) {
    const normalizedSearch = state.adsSearch.trim()

    if (normalizedSearch.length === 0) {
      return ADS_LIST_PATH
    }

    if (normalizedSearch.startsWith("?")) {
      return `${ADS_LIST_PATH}${normalizedSearch}`
    }
  }

  return ADS_LIST_PATH
}

export function AdViewPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const adId = parseAdId(id)
  const backHref = resolveBackHref(location.state)
  const detailQuery = useQuery({
    ...adDetailQuery(adId ?? 0),
    enabled: adId !== null
  })

  if (adId === null) {
    return <AdViewNotFoundState backHref={backHref} />
  }

  if (detailQuery.isPending) {
    return <AdViewLayoutSkeleton />
  }

  if (detailQuery.isError) {
    if (
      isAppApiError(detailQuery.error) &&
      detailQuery.error.code === "NOT_FOUND"
    ) {
      return <AdViewNotFoundState backHref={backHref} />
    }

    return (
      <AdViewErrorState
        backHref={backHref}
        message={
          isAppApiError(detailQuery.error)
            ? detailQuery.error.message
            : undefined
        }
        onRetry={() => {
          void detailQuery.refetch()
        }}
      />
    )
  }

  return (
    <AdViewLayout
      ad={detailQuery.data}
      backHref={backHref}
      editHref={buildAdEditPath(adId)}
    />
  )
}

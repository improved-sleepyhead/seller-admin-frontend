import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useLocation, useParams } from "react-router-dom"

import { adDetailQuery, cancelAdDetailQuery } from "@/entities/ad/api"
import {
  getAdsListHref,
  getAdsSearch,
  type AdsListNavigationState
} from "@/entities/ad/model"
import { isAppApiError } from "@/shared/api/error"
import {
  AdViewErrorState,
  AdViewLayout,
  AdViewLayoutSkeleton,
  AdViewNotFoundState
} from "@/widgets/ad-view-layout"

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

export function AdViewPage() {
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const adId = parseAdId(id)
  const backHref = getAdsListHref(location.state)
  const adsSearch = getAdsSearch(location.state)
  const editState: AdsListNavigationState | undefined =
    adsSearch === null ? undefined : { adsSearch }
  const detailQuery = useQuery({
    ...adDetailQuery(adId ?? 0),
    enabled: adId !== null
  })

  useEffect(() => {
    if (adId === null) {
      return
    }

    return () => {
      void cancelAdDetailQuery(queryClient, adId)
    }
  }, [adId, queryClient])

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
      editState={editState}
    />
  )
}

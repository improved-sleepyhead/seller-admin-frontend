import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"

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

export function AdViewPage() {
  const { id } = useParams<{ id: string }>()
  const adId = parseAdId(id)
  const detailQuery = useQuery({
    ...adDetailQuery(adId ?? 0),
    enabled: adId !== null
  })

  if (adId === null) {
    return <AdViewNotFoundState backHref={ADS_LIST_PATH} />
  }

  if (detailQuery.isPending) {
    return <AdViewLayoutSkeleton />
  }

  if (detailQuery.isError) {
    if (
      isAppApiError(detailQuery.error) &&
      detailQuery.error.code === "NOT_FOUND"
    ) {
      return <AdViewNotFoundState backHref={ADS_LIST_PATH} />
    }

    return (
      <AdViewErrorState
        backHref={ADS_LIST_PATH}
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
      backHref={ADS_LIST_PATH}
      editHref={buildAdEditPath(adId)}
    />
  )
}

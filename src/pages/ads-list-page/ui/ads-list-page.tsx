import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"

import {
  adsListQuery,
  mapAdsUrlParamsToListQuery,
  parseAdsSearchParams
} from "@/entities/ad"
import { AdsPagination } from "@/features/ads-pagination"
import { isAppApiError } from "@/shared/api/error"
import {
  AdsCatalog,
  AdsCatalogSkeleton,
  AdsEmptyState,
  AdsErrorState
} from "@/widgets/ads-catalog"
import { AdsFiltersPanel } from "@/widgets/ads-filters-panel"
import { AdsToolbar } from "@/widgets/ads-toolbar"

export function AdsListPage() {
  const [searchParams] = useSearchParams()
  const normalizedParams = useMemo(() => {
    return parseAdsSearchParams(searchParams)
  }, [searchParams])

  const listQueryParams = useMemo(() => {
    return mapAdsUrlParamsToListQuery(normalizedParams)
  }, [normalizedParams])

  const adsQuery = useQuery(adsListQuery(listQueryParams))

  const catalogContent = (() => {
    if (adsQuery.isPending) {
      return <AdsCatalogSkeleton layout={normalizedParams.layout} />
    }

    if (adsQuery.isError) {
      return (
        <AdsErrorState
          message={
            isAppApiError(adsQuery.error) ? adsQuery.error.message : undefined
          }
          onRetry={() => {
            void adsQuery.refetch()
          }}
        />
      )
    }

    if (adsQuery.data.items.length === 0) {
      return <AdsEmptyState />
    }

    return (
      <AdsCatalog ads={adsQuery.data.items} layout={normalizedParams.layout} />
    )
  })()

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <AdsToolbar isRefreshing={adsQuery.isFetching && !adsQuery.isPending} />

      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AdsFiltersPanel />

        <section className="space-y-6">
          {catalogContent}
          <div className="flex justify-center">
            <AdsPagination total={adsQuery.data?.total ?? 0} />
          </div>
        </section>
      </div>
    </div>
  )
}

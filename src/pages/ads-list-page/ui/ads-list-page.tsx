import {
  keepPreviousData,
  useQuery,
  useQueryClient
} from "@tanstack/react-query"
import { useEffect, useMemo } from "react"

import {
  adsListQuery,
  cancelAdsListQuery,
  mapAdsUrlParamsToListQuery
} from "@/entities/ad/api"
import { useAdsListState } from "@/entities/ad/model"
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

import { useAdsListUrlSync } from "../model"

export function AdsListPage() {
  const queryClient = useQueryClient()
  const q = useAdsListState(state => state.q)
  const categories = useAdsListState(state => state.categories)
  const needsRevision = useAdsListState(state => state.needsRevision)
  const sortColumn = useAdsListState(state => state.sortColumn)
  const sortDirection = useAdsListState(state => state.sortDirection)
  const page = useAdsListState(state => state.page)
  const layout = useAdsListState(state => state.layout)
  const { isHydrated } = useAdsListUrlSync()

  const listQueryParams = useMemo(() => {
    return mapAdsUrlParamsToListQuery({
      categories,
      layout,
      needsRevision,
      page,
      q,
      sortColumn,
      sortDirection
    })
  }, [categories, layout, needsRevision, page, q, sortColumn, sortDirection])
  const adsQuery = useQuery({
    ...adsListQuery(listQueryParams),
    enabled: isHydrated,
    placeholderData: keepPreviousData
  })

  useEffect(() => {
    return () => {
      void cancelAdsListQuery(queryClient, listQueryParams)
    }
  }, [listQueryParams, queryClient])

  const renderCatalogContent = () => {
    if (!isHydrated || (adsQuery.isPending && !adsQuery.data)) {
      return <AdsCatalogSkeleton layout={layout} />
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

    return <AdsCatalog ads={adsQuery.data.items} layout={layout} />
  }
  const catalogContent = renderCatalogContent()

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

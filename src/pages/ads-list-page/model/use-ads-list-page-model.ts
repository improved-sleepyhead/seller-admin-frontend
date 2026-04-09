import {
  keepPreviousData,
  useQuery,
  useQueryClient
} from "@tanstack/react-query"
import { useEffect, useMemo } from "react"

import {
  adsListQuery,
  cancelAdsListQuery,
  toListQuery
} from "@/entities/ad/api"
import { createAdsNavigationState, useAdsListState } from "@/entities/ad-list"

import { getAdsListPageCatalogState } from "./ads-list-page.catalog-state"
import { useAdsListUrlSync } from "./use-ads-list-url-sync"

import type { AdsListPageModel } from "./ads-list-page.contract"

export function useAdsListPageModel(): AdsListPageModel {
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
    return toListQuery({
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
  const navigationState = useMemo(() => {
    return createAdsNavigationState({
      categories,
      layout,
      needsRevision,
      page,
      q,
      sortColumn,
      sortDirection
    })
  }, [categories, layout, needsRevision, page, q, sortColumn, sortDirection])

  useEffect(() => {
    return () => {
      void cancelAdsListQuery(queryClient, listQueryParams)
    }
  }, [listQueryParams, queryClient])

  return {
    catalog: getAdsListPageCatalogState({
      data: adsQuery.data,
      error: adsQuery.error,
      isError: adsQuery.isError,
      isHydrated,
      isPending: adsQuery.isPending,
      onRetry: () => {
        void adsQuery.refetch()
      }
    }),
    isRefreshing: adsQuery.isFetching && !adsQuery.isPending,
    layout,
    navigationState,
    total: adsQuery.data?.total ?? 0
  }
}

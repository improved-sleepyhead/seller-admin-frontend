import { useCallback } from "react"

import { type AdSortColumn, type AdSortDirection } from "@/entities/ad/api"
import { useAdsListState } from "@/entities/ad/model"

interface UseAdsSortingResult {
  sortColumn: AdSortColumn
  sortDirection: AdSortDirection
  setSortColumn: (nextSortColumn: AdSortColumn) => void
  setSortDirection: (nextSortDirection: AdSortDirection) => void
}

export function useAdsSorting(): UseAdsSortingResult {
  const sortColumn = useAdsListState(state => state.sortColumn)
  const sortDirection = useAdsListState(state => state.sortDirection)
  const setSort = useAdsListState(state => state.setSort)

  const setSortColumn = useCallback(
    (nextSortColumn: AdSortColumn) => {
      setSort({
        sortColumn: nextSortColumn,
        sortDirection
      })
    },
    [setSort, sortDirection]
  )

  const setSortDirection = useCallback(
    (nextSortDirection: AdSortDirection) => {
      setSort({
        sortColumn,
        sortDirection: nextSortDirection
      })
    },
    [setSort, sortColumn]
  )

  return {
    setSortColumn,
    setSortDirection,
    sortColumn,
    sortDirection
  }
}

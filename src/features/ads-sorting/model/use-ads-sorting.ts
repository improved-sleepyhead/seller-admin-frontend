import { useCallback } from "react"
import { useSearchParams } from "react-router-dom"

import {
  createAdsSearchParams,
  parseAdsSearchParams,
  type AdSortColumn,
  type AdSortDirection
} from "@/entities/ad"

interface UseAdsSortingResult {
  sortColumn: AdSortColumn
  sortDirection: AdSortDirection
  setSortColumn: (nextSortColumn: AdSortColumn) => void
  setSortDirection: (nextSortDirection: AdSortDirection) => void
}

export function useAdsSorting(): UseAdsSortingResult {
  const [searchParams, setSearchParams] = useSearchParams()
  const normalizedParams = parseAdsSearchParams(searchParams)

  const setSortColumn = useCallback(
    (nextSortColumn: AdSortColumn) => {
      const nextParams = parseAdsSearchParams(searchParams)

      setSearchParams(
        createAdsSearchParams({
          ...nextParams,
          page: 1,
          sortColumn: nextSortColumn
        })
      )
    },
    [searchParams, setSearchParams]
  )

  const setSortDirection = useCallback(
    (nextSortDirection: AdSortDirection) => {
      const nextParams = parseAdsSearchParams(searchParams)

      setSearchParams(
        createAdsSearchParams({
          ...nextParams,
          page: 1,
          sortDirection: nextSortDirection
        })
      )
    },
    [searchParams, setSearchParams]
  )

  return {
    setSortColumn,
    setSortDirection,
    sortColumn: normalizedParams.sortColumn,
    sortDirection: normalizedParams.sortDirection
  }
}

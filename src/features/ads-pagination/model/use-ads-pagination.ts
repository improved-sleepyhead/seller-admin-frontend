import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"

import {
  ADS_LIST_PAGE_SIZE,
  createAdsSearchParams,
  parseAdsSearchParams
} from "@/entities/ad"

interface UseAdsPaginationOptions {
  total: number
}

interface UseAdsPaginationResult {
  currentPage: number
  totalPages: number
  goToPage: (nextPage: number) => void
}

function getTotalPages(total: number, pageSize: number): number {
  if (total <= 0 || pageSize <= 0) {
    return 1
  }

  return Math.max(1, Math.ceil(total / pageSize))
}

export function useAdsPagination({
  total
}: UseAdsPaginationOptions): UseAdsPaginationResult {
  const [searchParams, setSearchParams] = useSearchParams()
  const normalizedParams = parseAdsSearchParams(searchParams)

  const totalPages = useMemo(() => {
    return getTotalPages(total, ADS_LIST_PAGE_SIZE)
  }, [total])

  const currentPage = Math.min(normalizedParams.page, totalPages)

  const goToPage = useCallback(
    (nextPage: number) => {
      const nextParams = parseAdsSearchParams(searchParams)
      const clampedPage = Math.max(1, Math.min(nextPage, totalPages))

      setSearchParams(
        createAdsSearchParams({
          ...nextParams,
          page: clampedPage
        })
      )
    },
    [searchParams, setSearchParams, totalPages]
  )

  return {
    currentPage,
    goToPage,
    totalPages
  }
}

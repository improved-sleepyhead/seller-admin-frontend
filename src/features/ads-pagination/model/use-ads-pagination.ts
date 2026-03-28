import { useCallback, useMemo } from "react"

import { ADS_LIST_PAGE_SIZE, useAdsListState } from "@/entities/ad"

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
  const page = useAdsListState(state => state.page)
  const setPage = useAdsListState(state => state.setPage)

  const totalPages = useMemo(() => {
    return getTotalPages(total, ADS_LIST_PAGE_SIZE)
  }, [total])

  const currentPage = Math.min(page, totalPages)

  const goToPage = useCallback(
    (nextPage: number) => {
      const clampedPage = Math.max(1, Math.min(nextPage, totalPages))
      setPage(clampedPage)
    },
    [setPage, totalPages]
  )

  return {
    currentPage,
    goToPage,
    totalPages
  }
}

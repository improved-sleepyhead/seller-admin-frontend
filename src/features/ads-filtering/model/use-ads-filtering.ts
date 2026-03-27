import { useCallback } from "react"
import { useSearchParams } from "react-router-dom"

import {
  AD_CATEGORIES,
  ADS_LIST_DEFAULT_URL_PARAMS,
  createAdsSearchParams,
  parseAdsSearchParams,
  type AdCategory
} from "@/entities/ad"

interface UseAdsFilteringResult {
  categories: AdCategory[]
  needsRevision: boolean
  toggleCategory: (category: AdCategory, checked: boolean) => void
  setNeedsRevision: (checked: boolean) => void
  resetFilters: () => void
}

export function useAdsFiltering(): UseAdsFilteringResult {
  const [searchParams, setSearchParams] = useSearchParams()
  const normalizedParams = parseAdsSearchParams(searchParams)

  const toggleCategory = useCallback(
    (category: AdCategory, checked: boolean) => {
      const nextParams = parseAdsSearchParams(searchParams)
      const selectedCategories = new Set(nextParams.categories)

      if (checked) {
        selectedCategories.add(category)
      } else {
        selectedCategories.delete(category)
      }

      setSearchParams(
        createAdsSearchParams({
          ...nextParams,
          categories: AD_CATEGORIES.filter(nextCategory =>
            selectedCategories.has(nextCategory)
          ),
          page: 1
        })
      )
    },
    [searchParams, setSearchParams]
  )

  const setNeedsRevision = useCallback(
    (checked: boolean) => {
      const nextParams = parseAdsSearchParams(searchParams)

      setSearchParams(
        createAdsSearchParams({
          ...nextParams,
          needsRevision: checked,
          page: 1
        })
      )
    },
    [searchParams, setSearchParams]
  )

  const resetFilters = useCallback(() => {
    setSearchParams(createAdsSearchParams(ADS_LIST_DEFAULT_URL_PARAMS))
  }, [setSearchParams])

  return {
    categories: normalizedParams.categories,
    needsRevision: normalizedParams.needsRevision,
    resetFilters,
    setNeedsRevision,
    toggleCategory
  }
}

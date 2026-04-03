import { useCallback } from "react"

import { AD_CATEGORIES, type AdCategory } from "@/entities/ad/api"
import { useAdsListState } from "@/entities/ad/model"

interface UseAdsFilteringResult {
  categories: AdCategory[]
  needsRevision: boolean
  toggleCategory: (category: AdCategory, checked: boolean) => void
  setNeedsRevision: (checked: boolean) => void
  resetFilters: () => void
}

export function useAdsFiltering(): UseAdsFilteringResult {
  const categories = useAdsListState(state => state.categories)
  const needsRevision = useAdsListState(state => state.needsRevision)
  const setCategories = useAdsListState(state => state.setCategories)
  const setNeedsRevision = useAdsListState(state => state.setNeedsRevision)
  const resetFilters = useAdsListState(state => state.resetFilters)

  const toggleCategory = useCallback(
    (category: AdCategory, checked: boolean) => {
      const selectedCategories = new Set(categories)

      if (checked) {
        selectedCategories.add(category)
      } else {
        selectedCategories.delete(category)
      }

      setCategories(
        AD_CATEGORIES.filter(nextCategory =>
          selectedCategories.has(nextCategory)
        )
      )
    },
    [categories, setCategories]
  )

  return {
    categories,
    needsRevision,
    resetFilters,
    setNeedsRevision,
    toggleCategory
  }
}

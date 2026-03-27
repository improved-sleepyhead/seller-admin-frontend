import { Button } from "@/shared/ui/shadcn"

import { useAdsFiltering } from "../model"

export function ResetFiltersButton() {
  const { resetFilters } = useAdsFiltering()

  return (
    <Button type="button" variant="outline" onClick={resetFilters}>
      Сбросить фильтры
    </Button>
  )
}

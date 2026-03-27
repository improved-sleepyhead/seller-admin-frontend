import { AD_CATEGORIES, AD_CATEGORY_LABELS } from "@/entities/ad"
import { Checkbox, Label } from "@/shared/ui/shadcn"

import { useAdsFiltering } from "../model"

export function CategoryFilterGroup() {
  const { categories, toggleCategory } = useAdsFiltering()

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Категории</p>
      <div className="space-y-2">
        {AD_CATEGORIES.map(category => {
          const checked = categories.includes(category)
          const fieldId = `category-filter-${category}`

          return (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={fieldId}
                checked={checked}
                onCheckedChange={nextValue =>
                  toggleCategory(category, nextValue === true)
                }
              />
              <Label htmlFor={fieldId}>{AD_CATEGORY_LABELS[category]}</Label>
            </div>
          )
        })}
      </div>
    </div>
  )
}

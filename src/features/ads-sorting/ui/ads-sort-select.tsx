import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shared/ui/shadcn"

import {
  SORT_COLUMN_OPTIONS,
  SORT_DIRECTION_OPTIONS,
  useAdsSorting
} from "../model"

export function AdsSortSelect() {
  const { sortColumn, sortDirection, setSortColumn, setSortDirection } =
    useAdsSorting()

  return (
    <div className="grid w-full gap-2 sm:grid-cols-2">
      <Select value={sortColumn} onValueChange={setSortColumn}>
        <SelectTrigger aria-label="Сортировка по полю">
          <SelectValue placeholder="Сортировка" />
        </SelectTrigger>
        <SelectContent>
          {SORT_COLUMN_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortDirection} onValueChange={setSortDirection}>
        <SelectTrigger aria-label="Направление сортировки">
          <SelectValue placeholder="Направление" />
        </SelectTrigger>
        <SelectContent>
          {SORT_DIRECTION_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

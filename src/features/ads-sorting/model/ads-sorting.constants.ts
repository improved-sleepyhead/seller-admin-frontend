import type { AdSortColumn, AdSortDirection } from "@/entities/ad"

interface SortColumnOption {
  label: string
  value: AdSortColumn
}

interface SortDirectionOption {
  label: string
  value: AdSortDirection
}

export const SORT_COLUMN_OPTIONS: SortColumnOption[] = [
  {
    label: "Название",
    value: "title"
  },
  {
    label: "Дата создания",
    value: "createdAt"
  },
  {
    label: "Цена",
    value: "price"
  }
]

export const SORT_DIRECTION_OPTIONS: SortDirectionOption[] = [
  {
    label: "По возрастанию",
    value: "asc"
  },
  {
    label: "По убыванию",
    value: "desc"
  }
]

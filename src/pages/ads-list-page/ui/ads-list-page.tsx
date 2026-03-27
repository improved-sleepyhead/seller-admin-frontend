import { useSearchParams } from "react-router-dom"

import { parseAdsSearchParams } from "@/entities/ad"
import {
  CategoryFilterGroup,
  ResetFiltersButton,
  RevisionToggle
} from "@/features/ads-filtering"
import { AdsLayoutSwitch } from "@/features/ads-layout-switch"
import { AdsPagination } from "@/features/ads-pagination"
import { AdsSearchInput } from "@/features/ads-search"
import { AdsSortSelect } from "@/features/ads-sorting"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/shadcn"

export function AdsListPage() {
  const [searchParams] = useSearchParams()
  const normalizedParams = parseAdsSearchParams(searchParams)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Card>
        <CardHeader className="gap-1">
          <CardTitle>Список объявлений</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[1.4fr_1fr_auto]">
          <AdsSearchInput />
          <AdsSortSelect />
          <AdsLayoutSwitch />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-1">
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <CategoryFilterGroup />
            <RevisionToggle />
          </div>
          <div className="self-start">
            <ResetFiltersButton />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-1">
          <CardTitle>Пагинация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdsPagination total={120} />
          <p className="text-muted-foreground text-sm">
            Текущая страница: {normalizedParams.page}
          </p>
          <p className="text-muted-foreground text-xs">
            Query string: {searchParams.toString() || "(empty)"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

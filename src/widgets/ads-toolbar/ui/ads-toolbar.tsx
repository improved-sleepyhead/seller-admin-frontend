import { AdsLayoutSwitch } from "@/features/ads-layout-switch"
import { AdsSearchInput } from "@/features/ads-search"
import { AdsSortSelect } from "@/features/ads-sorting"
import { cn } from "@/shared/lib/cn"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/shadcn"

interface AdsToolbarProps {
  isRefreshing?: boolean
}

export function AdsToolbar({ isRefreshing = false }: AdsToolbarProps) {
  return (
    <Card>
      <CardHeader className="gap-1 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Список объявлений</CardTitle>
        <p
          className={cn(
            "text-muted-foreground min-h-5 text-sm",
            isRefreshing ? "visible" : "invisible"
          )}
        >
          Обновляем список...
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-[1.5fr_1fr_auto]">
        <AdsSearchInput />
        <AdsSortSelect />
        <AdsLayoutSwitch />
      </CardContent>
    </Card>
  )
}

import { Loader2Icon } from "lucide-react"

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
      <CardHeader>
        <div className="flex min-h-5 items-center gap-2">
          <CardTitle>Список объявлений</CardTitle>
          <Loader2Icon
            aria-hidden={!isRefreshing}
            className={cn(
              "text-muted-foreground h-4 w-4",
              isRefreshing ? "animate-spin opacity-100" : "opacity-0"
            )}
          />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-[1.5fr_1fr_auto]">
        <AdsSearchInput />
        <AdsSortSelect />
        <AdsLayoutSwitch />
      </CardContent>
    </Card>
  )
}

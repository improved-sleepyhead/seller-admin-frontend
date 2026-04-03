import { Search } from "lucide-react"

import { Input } from "@/shared/ui/shadcn"

import { useAdsSearchInput } from "../model"

export function AdsSearchInput() {
  const { queryValue, setQueryValue } = useAdsSearchInput()
  const inputId = "ads-search-input"

  return (
    <div className="relative w-full">
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        aria-hidden
      />
      <Input
        aria-label="Поиск объявлений"
        id={inputId}
        name="q"
        placeholder="Поиск по объявлениям"
        value={queryValue}
        onChange={event => setQueryValue(event.target.value)}
        className="pl-9"
      />
    </div>
  )
}

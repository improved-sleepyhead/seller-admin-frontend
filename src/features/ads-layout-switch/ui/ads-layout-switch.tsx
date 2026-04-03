import { LayoutGrid, Rows3 } from "lucide-react"

import { Button } from "@/shared/ui/shadcn"

import { useAdsLayoutSwitch } from "../model"

export function AdsLayoutSwitch() {
  const { activeLayout, setLayout } = useAdsLayoutSwitch()

  return (
    <div
      role="group"
      aria-label="Переключение режима отображения"
      className="hidden items-center gap-2 sm:flex"
    >
      <Button
        type="button"
        size="sm"
        variant={activeLayout === "grid" ? "default" : "outline"}
        onClick={() => setLayout("grid")}
      >
        <LayoutGrid aria-hidden className="size-4" />
        Grid
      </Button>
      <Button
        type="button"
        size="sm"
        variant={activeLayout === "list" ? "default" : "outline"}
        onClick={() => setLayout("list")}
      >
        <Rows3 aria-hidden className="size-4" />
        List
      </Button>
    </div>
  )
}

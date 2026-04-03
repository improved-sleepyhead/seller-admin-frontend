import { SlidersHorizontal } from "lucide-react"
import { useState } from "react"

import {
  CategoryFilterGroup,
  ResetFiltersButton,
  RevisionToggle
} from "@/features/ads-filtering"
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/shared/ui/shadcn"

function FiltersContent() {
  return (
    <div className="space-y-4">
      <CategoryFilterGroup />
      <RevisionToggle />
      <ResetFiltersButton />
    </div>
  )
}

export function AdsFiltersPanel() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <div className="lg:hidden">
        <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
          <DrawerTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <SlidersHorizontal aria-hidden className="size-4" />
              Фильтры
            </Button>
          </DrawerTrigger>

          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Фильтры объявлений</DrawerTitle>
              <DrawerDescription>
                Выберите категории и режим доработок.
              </DrawerDescription>
            </DrawerHeader>

            <div className="overflow-y-auto px-4 pb-6">
              <FiltersContent />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <aside className="hidden lg:block">
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-base">Фильтры</CardTitle>
          </CardHeader>
          <CardContent>
            <FiltersContent />
          </CardContent>
        </Card>
      </aside>
    </>
  )
}

import { cn } from "@/shared/lib/cn"
import { Card, CardContent } from "@/shared/ui/shadcn"

import { AdCategoryBadge } from "./ad-category-badge"
import { AdImage } from "./ad-image"
import { AdPrice } from "./ad-price"
import { AdRevisionBadge } from "./ad-revision-badge"

import type { AdsListItemVM } from "../api"

interface AdCardListItemProps {
  ad: AdsListItemVM
  className?: string
}

export function AdCardListItem({ ad, className }: AdCardListItemProps) {
  return (
    <Card className={cn("overflow-hidden py-0", className)}>
      <div className="flex flex-col sm:flex-row">
        <div className="h-48 w-full shrink-0 sm:h-auto sm:w-56">
          <AdImage
            src={ad.previewImageSrc}
            alt={ad.title}
            className="rounded-none"
          />
        </div>

        <CardContent className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
          <div className="space-y-2">
            <h3 className="line-clamp-2 text-base leading-tight font-medium">
              {ad.title}
            </h3>
            <AdPrice priceLabel={ad.priceLabel} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AdCategoryBadge categoryLabel={ad.categoryLabel} />
            {ad.needsRevision ? <AdRevisionBadge /> : null}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

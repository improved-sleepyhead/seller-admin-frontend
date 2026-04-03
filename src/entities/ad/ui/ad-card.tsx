import { cn } from "@/shared/lib/cn"
import { Card, CardContent } from "@/shared/ui/shadcn"

import { AdCategoryBadge } from "./ad-category-badge"
import { AdImage } from "./ad-image"
import { AdPrice } from "./ad-price"
import { AdRevisionBadge } from "./ad-revision-badge"

import type { AdsListItemVM } from "../api"

interface AdCardProps {
  ad: AdsListItemVM
  className?: string
}

export function AdCard({ ad, className }: AdCardProps) {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden py-0 transition-colors duration-200",
        className
      )}
    >
      <div className="aspect-[4/3] w-full">
        <AdImage src={ad.previewImageSrc} alt={ad.title} />
      </div>

      <CardContent className="space-y-3 p-4">
        <h3 className="line-clamp-2 text-sm leading-tight font-medium">
          {ad.title}
        </h3>
        <AdPrice priceLabel={ad.priceLabel} />

        <div className="flex flex-wrap items-center gap-2">
          <AdCategoryBadge categoryLabel={ad.categoryLabel} />
          {ad.needsRevision ? <AdRevisionBadge /> : null}
        </div>
      </CardContent>
    </Card>
  )
}

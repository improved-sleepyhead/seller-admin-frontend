import { Badge } from "@/shared/ui/shadcn"

interface AdCategoryBadgeProps {
  categoryLabel: string
}

export function AdCategoryBadge({ categoryLabel }: AdCategoryBadgeProps) {
  return <Badge variant="secondary">{categoryLabel}</Badge>
}

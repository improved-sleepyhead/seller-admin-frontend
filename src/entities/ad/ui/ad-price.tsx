import { cn } from "@/shared/lib/cn"

interface AdPriceProps {
  className?: string
  priceLabel: string
}

export function AdPrice({ className, priceLabel }: AdPriceProps) {
  return <p className={cn("text-lg font-semibold", className)}>{priceLabel}</p>
}

import { Loader2Icon } from "lucide-react"

import { cn } from "@/shared/lib/cn"

import type { LucideProps } from "lucide-react"

export function Loader({ className, ...props }: LucideProps) {
  return (
    <Loader2Icon className={cn("size-4 animate-spin", className)} {...props} />
  )
}

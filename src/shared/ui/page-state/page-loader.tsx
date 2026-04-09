import { cn } from "@/shared/lib/cn"
import { Loader } from "@/shared/ui/loader"

import type { ComponentProps } from "react"

interface PageLoaderProps extends ComponentProps<"div"> {
  label?: string
}

export function PageLoader({
  className,
  label = "Загружаем страницу...",
  ...props
}: PageLoaderProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "flex min-h-[80vh] w-full items-center justify-center",
        className
      )}
      role="status"
      {...props}
    >
      <div className="bg-card text-muted-foreground border-border/60 flex items-center gap-3 rounded-full border px-4 py-3 text-sm shadow-sm">
        <Loader aria-hidden="true" className="text-primary" />
        <span>{label}</span>
      </div>
    </div>
  )
}

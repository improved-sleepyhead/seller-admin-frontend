import { ImageOff } from "lucide-react"

import { cn } from "@/shared/lib/cn"

interface ImagePlaceholderProps {
  className?: string
  label?: string
}

export function ImagePlaceholder({
  className,
  label = "Нет изображения"
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "bg-muted text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-center",
        className
      )}
    >
      <ImageOff className="size-5" aria-hidden />
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}

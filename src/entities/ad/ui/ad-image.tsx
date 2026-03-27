import { cn } from "@/shared/lib/cn"
import { ImagePlaceholder } from "@/shared/ui/placeholders"

interface AdImageProps {
  alt: string
  className?: string
  src: string | null | undefined
}

function hasImage(src: string | null | undefined): src is string {
  return typeof src === "string" && src.trim().length > 0
}

export function AdImage({ alt, className, src }: AdImageProps) {
  if (!hasImage(src)) {
    return <ImagePlaceholder className={className} />
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full rounded-md object-cover", className)}
      loading="lazy"
    />
  )
}

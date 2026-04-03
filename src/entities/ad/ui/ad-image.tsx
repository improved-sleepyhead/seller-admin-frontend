import { useEffect, useState } from "react"

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
  const [hasLoadError, setHasLoadError] = useState(false)

  useEffect(() => {
    setHasLoadError(false)
  }, [src])

  if (!hasImage(src) || hasLoadError) {
    return <ImagePlaceholder className={className} />
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => {
        setHasLoadError(true)
      }}
      className={cn("h-full w-full rounded-md object-cover", className)}
      loading="lazy"
    />
  )
}

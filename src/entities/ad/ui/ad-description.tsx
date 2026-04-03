import { cn } from "@/shared/lib/cn"

interface AdDescriptionProps {
  className?: string
  descriptionText: string
}

function getDescriptionText(descriptionText: string): string {
  const normalized = descriptionText.trim()
  return normalized.length > 0 ? normalized : "Описание отсутствует"
}

export function AdDescription({
  className,
  descriptionText
}: AdDescriptionProps) {
  return (
    <p className={cn("text-sm whitespace-pre-line", className)}>
      {getDescriptionText(descriptionText)}
    </p>
  )
}

interface DraftSavedHintProps {
  savedAt: string | null
}

function formatSavedAt(savedAt: string): string | null {
  const parsedDate = new Date(savedAt)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })
}

export function DraftSavedHint({ savedAt }: DraftSavedHintProps) {
  const formattedSavedAt = savedAt === null ? null : formatSavedAt(savedAt)
  const hintText =
    formattedSavedAt === null
      ? "Автосохранение черновика включено."
      : `Черновик сохранён локально в ${formattedSavedAt}.`

  return (
    <p aria-live="polite" className="text-muted-foreground text-xs">
      {hintText}
    </p>
  )
}

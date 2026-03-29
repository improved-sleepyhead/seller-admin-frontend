import { useMemo } from "react"

import {
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/shared/ui/shadcn"

import {
  buildDiffViewerModel,
  type DescriptionDiffModel,
  type DiffChunk,
  type DiffChunkKind
} from "../lib"

interface AdDiffViewerProps {
  diff: DescriptionDiffModel | null
  isMobile: boolean
  onOpenChange: (nextOpen: boolean) => void
  open: boolean
}

interface DiffTextPanelProps {
  chunks: DiffChunk[]
  emptyText: string
  highlightKind: Exclude<DiffChunkKind, "unchanged">
  title: string
}

function getHighlightClass(
  highlightKind: DiffTextPanelProps["highlightKind"]
): string {
  if (highlightKind === "added") {
    return "rounded-sm bg-emerald-500/20 px-0.5 text-emerald-900 dark:bg-emerald-500/35 dark:text-emerald-100"
  }

  return "rounded-sm bg-red-500/20 px-0.5 text-red-900 dark:bg-red-500/35 dark:text-red-100"
}

function DiffTextPanel({
  chunks,
  emptyText,
  highlightKind,
  title
}: DiffTextPanelProps) {
  const hasVisibleText = chunks.some(chunk => chunk.value.trim().length > 0)

  return (
    <div className="space-y-1">
      <h4 className="text-muted-foreground text-xs font-semibold">{title}</h4>
      <p className="rounded-md border p-3 text-sm whitespace-pre-wrap">
        {!hasVisibleText
          ? emptyText
          : chunks.map((chunk, index) => {
              const isWhitespaceChunk = chunk.value.trim().length === 0
              const shouldHighlight =
                !isWhitespaceChunk && chunk.kind === highlightKind

              if (!shouldHighlight) {
                return <span key={`${chunk.kind}-${index}`}>{chunk.value}</span>
              }

              return (
                <span
                  key={`${chunk.kind}-${index}`}
                  aria-label={
                    highlightKind === "added"
                      ? `Добавлено: ${chunk.value}`
                      : `Удалено: ${chunk.value}`
                  }
                  className={getHighlightClass(highlightKind)}
                >
                  {chunk.value}
                </span>
              )
            })}
      </p>
    </div>
  )
}

function DiffLegend() {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Badge
          className="border-emerald-500/40 bg-emerald-500/20 text-emerald-900 dark:bg-emerald-500/35 dark:text-emerald-100"
          variant="outline"
        >
          Добавлено
        </Badge>
        <Badge
          className="border-red-500/40 bg-red-500/20 text-red-900 dark:bg-red-500/35 dark:text-red-100"
          variant="outline"
        >
          Удалено
        </Badge>
      </div>
      <p className="text-muted-foreground text-xs">
        Отличия показаны цветом и текстовыми подписями в этой легенде.
      </p>
    </div>
  )
}

export function AdDiffViewer({
  diff,
  isMobile,
  onOpenChange,
  open
}: AdDiffViewerProps) {
  const viewerModel = useMemo(() => {
    if (diff === null) {
      return null
    }

    return buildDiffViewerModel(diff)
  }, [diff])

  if (viewerModel === null) {
    return null
  }

  const panels = (
    <div className={isMobile ? "grid gap-4" : "grid gap-4 md:grid-cols-2"}>
      <DiffTextPanel
        chunks={viewerModel.sourceChunks}
        emptyText="Описание отсутствует"
        highlightKind="removed"
        title="Было"
      />
      <DiffTextPanel
        chunks={viewerModel.suggestionChunks}
        emptyText="Нет предложенного текста"
        highlightKind="added"
        title="Стало"
      />
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="max-h-[85vh] overflow-y-auto" side="bottom">
          <SheetHeader>
            <SheetTitle>Сравнение описания</SheetTitle>
            <SheetDescription>
              До применения проверьте, как изменится текст объявления.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 px-4 pb-4">
            <DiffLegend />
            {panels}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Сравнение описания</DialogTitle>
          <DialogDescription>
            До применения проверьте, как изменится текст объявления.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <DiffLegend />
          {panels}
        </div>
      </DialogContent>
    </Dialog>
  )
}

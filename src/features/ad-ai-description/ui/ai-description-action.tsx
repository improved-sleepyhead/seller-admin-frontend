import { Loader2Icon } from "lucide-react"

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/shared/ui/shadcn"

import { useAiDescriptionAction, type AdEditFormApi } from "../model"

interface AiDescriptionActionProps {
  disabled: boolean
  form: AdEditFormApi | null
}

interface AiDescriptionResultContentProps {
  applySuggestion: () => void
  cancelRequest: () => void
  closeResult: () => void
  errorMessage: string | null
  isPending: boolean
  retrySuggestion: () => Promise<void>
  suggestionText: string | null
  viewDiff: () => void
}

function AiDescriptionResultContent({
  applySuggestion,
  cancelRequest,
  closeResult,
  errorMessage,
  isPending,
  retrySuggestion,
  suggestionText,
  viewDiff
}: AiDescriptionResultContentProps) {
  if (isPending) {
    return (
      <div className="space-y-4">
        <p className="text-sm">Генерируем улучшенный текст...</p>
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={cancelRequest}
        >
          Отменить запрос
        </Button>
      </div>
    )
  }

  if (errorMessage !== null) {
    return (
      <div className="space-y-4">
        <p className="text-destructive text-sm">{errorMessage}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="w-full"
            type="button"
            onClick={() => {
              void retrySuggestion()
            }}
          >
            Повторить запрос
          </Button>
          <Button
            className="w-full"
            type="button"
            variant="outline"
            onClick={closeResult}
          >
            Закрыть
          </Button>
        </div>
      </div>
    )
  }

  if (suggestionText === null) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs">Предложенный текст</p>
        <p className="text-sm whitespace-pre-wrap">{suggestionText}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Button className="w-full" type="button" onClick={applySuggestion}>
          Применить
        </Button>
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={viewDiff}
        >
          Сравнить изменения
        </Button>
        <Button
          className="w-full"
          type="button"
          variant="secondary"
          onClick={closeResult}
        >
          Закрыть
        </Button>
      </div>
    </div>
  )
}

export function AiDescriptionAction({
  disabled,
  form
}: AiDescriptionActionProps) {
  const {
    applySuggestion,
    cancelRequest,
    canRequestSuggestion,
    closeDiffViewer,
    closeResult,
    errorMessage,
    isDiffViewerOpen,
    isMobile,
    isPending,
    isResultOpen,
    requestSuggestion,
    retrySuggestion,
    setResultOpen,
    suggestionText,
    viewDiff,
    visibleDiff
  } = useAiDescriptionAction({
    disabled,
    form
  })

  const triggerButton = (
    <Button
      className="w-full"
      disabled={!canRequestSuggestion}
      type="button"
      variant="outline"
      onClick={() => {
        void requestSuggestion()
      }}
    >
      {isPending ? (
        <>
          <Loader2Icon className="size-4 animate-spin" />
          Генерируем описание...
        </>
      ) : (
        "Улучшить описание"
      )}
    </Button>
  )

  const resultContent = (
    <AiDescriptionResultContent
      applySuggestion={applySuggestion}
      cancelRequest={cancelRequest}
      closeResult={closeResult}
      errorMessage={errorMessage}
      isPending={isPending}
      retrySuggestion={retrySuggestion}
      suggestionText={suggestionText}
      viewDiff={viewDiff}
    />
  )

  return (
    <>
      {isMobile ? (
        <>
          {triggerButton}
          <Sheet open={isResultOpen} onOpenChange={setResultOpen}>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>AI-улучшение описания</SheetTitle>
                <SheetDescription>
                  Предложение сформировано из текущих данных объявления.
                </SheetDescription>
              </SheetHeader>
              <div className="px-4">{resultContent}</div>
              <SheetFooter />
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <Popover open={isResultOpen} onOpenChange={setResultOpen}>
          <PopoverAnchor asChild>{triggerButton}</PopoverAnchor>
          <PopoverContent align="start" className="w-[26rem] space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">AI-улучшение описания</h3>
              <p className="text-muted-foreground text-xs">
                Предложение сформировано из текущих данных объявления.
              </p>
            </div>
            {resultContent}
          </PopoverContent>
        </Popover>
      )}

      {isMobile ? (
        <Sheet open={isDiffViewerOpen} onOpenChange={closeDiffViewer}>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Сравнение описания</SheetTitle>
              <SheetDescription>
                До применения проверьте, как изменится текст объявления.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 px-4 pb-4">
              <div className="space-y-1">
                <h4 className="text-muted-foreground text-xs font-semibold">
                  Было
                </h4>
                <p className="rounded-md border p-3 text-sm whitespace-pre-wrap">
                  {visibleDiff?.current ?? "Описание отсутствует"}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-muted-foreground text-xs font-semibold">
                  Стало
                </h4>
                <p className="rounded-md border p-3 text-sm whitespace-pre-wrap">
                  {visibleDiff?.suggestion ?? "Нет предложенного текста"}
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isDiffViewerOpen} onOpenChange={closeDiffViewer}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Сравнение описания</DialogTitle>
              <DialogDescription>
                До применения проверьте, как изменится текст объявления.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <h4 className="text-muted-foreground text-xs font-semibold">
                  Было
                </h4>
                <p className="rounded-md border p-3 text-sm whitespace-pre-wrap">
                  {visibleDiff?.current ?? "Описание отсутствует"}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-muted-foreground text-xs font-semibold">
                  Стало
                </h4>
                <p className="rounded-md border p-3 text-sm whitespace-pre-wrap">
                  {visibleDiff?.suggestion ?? "Нет предложенного текста"}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

import { Loader2Icon } from "lucide-react"
import { lazy, Suspense } from "react"

import {
  Button,
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

const LazyAdDiffViewer = lazy(async () => {
  const module = await import("@/features/ad-diff-viewer")

  return { default: module.AdDiffViewer }
})

interface AiDescriptionActionProps {
  disabled: boolean
  form: AdEditFormApi | null
}

interface AiDescriptionResultContentProps {
  action: ReturnType<typeof useAiDescriptionAction>
}

function AiDescriptionResultContent({
  action
}: AiDescriptionResultContentProps) {
  if (action.request.isPending) {
    return (
      <div className="space-y-4">
        <p className="flex items-center gap-2 text-sm">
          <Loader2Icon className="size-4 animate-spin" />
          Генерируем улучшенный текст...
        </p>
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={action.request.cancel}
        >
          Отменить запрос
        </Button>
      </div>
    )
  }

  if (action.request.errorMessage !== null) {
    return (
      <div className="space-y-4">
        <p className="text-destructive text-sm">
          {action.request.errorMessage}
        </p>
        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            type="button"
            onClick={() => {
              void action.request.retry()
            }}
          >
            Повторить запрос
          </Button>
          <Button
            className="w-full"
            type="button"
            variant="outline"
            onClick={action.panel.close}
          >
            Закрыть
          </Button>
        </div>
      </div>
    )
  }

  if (action.suggestion.text === null) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs">Предложенный текст</p>
        <p className="text-sm whitespace-pre-wrap">{action.suggestion.text}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          type="button"
          onClick={action.suggestion.apply}
        >
          Применить
        </Button>
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={action.diff.open}
        >
          Сравнить изменения
        </Button>
        <Button
          className="w-full"
          type="button"
          variant="secondary"
          onClick={action.panel.close}
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
  const action = useAiDescriptionAction({
    disabled,
    form
  })

  const triggerButton = (
    <Button
      className="w-full"
      disabled={!action.request.canStart}
      type="button"
      variant="outline"
      onClick={() => {
        void action.request.start()
      }}
    >
      {action.request.isPending ? (
        <>
          <Loader2Icon className="size-4 animate-spin" />
          Генерируем описание...
        </>
      ) : (
        "Улучшить описание"
      )}
    </Button>
  )

  const resultContent = <AiDescriptionResultContent action={action} />

  return (
    <>
      {action.panel.isMobile ? (
        <>
          {triggerButton}
          <Sheet open={action.panel.isOpen} onOpenChange={action.panel.setOpen}>
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
        <Popover open={action.panel.isOpen} onOpenChange={action.panel.setOpen}>
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

      <Suspense fallback={null}>
        {action.diff.isOpen ? (
          <LazyAdDiffViewer
            diff={action.diff.value}
            isMobile={action.panel.isMobile}
            onOpenChange={nextOpen => {
              if (!nextOpen) {
                action.diff.close()
              }
            }}
            open={action.diff.isOpen}
          />
        ) : null}
      </Suspense>
    </>
  )
}

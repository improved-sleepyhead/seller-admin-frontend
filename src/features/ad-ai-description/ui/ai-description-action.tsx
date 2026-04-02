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

interface AiDescriptionDiffViewModel {
  close: () => void
  isOpen: boolean
  open: () => void
  value: NonNullable<ReturnType<typeof useAiDescriptionAction>["diff"]["value"]>
}

interface AiDescriptionPanelViewModel {
  isMobile: boolean
  isOpen: boolean
  setOpen: (nextOpen: boolean) => void
}

interface AiDescriptionTriggerViewModel {
  canStart: boolean
  isPending: boolean
  start: () => Promise<void>
}

type AiDescriptionResultContentModel =
  | {
      actions: {
        cancel: () => void
      }
      status: "pending"
    }
  | {
      actions: {
        close: () => void
        retry: () => Promise<void>
      }
      errorMessage: string
      status: "error"
    }
  | {
      actions: {
        apply: () => void
        close: () => void
        openDiff: () => void
      }
      result: {
        text: string
      }
      status: "ready"
    }
  | {
      status: "idle"
    }

interface AiDescriptionActionViewModel {
  content: AiDescriptionResultContentModel
  diff: AiDescriptionDiffViewModel | null
  panel: AiDescriptionPanelViewModel
  trigger: AiDescriptionTriggerViewModel
}

interface AiDescriptionResultContentProps {
  content: AiDescriptionResultContentModel
}

function getAiDescriptionActionViewModel(
  action: ReturnType<typeof useAiDescriptionAction>
): AiDescriptionActionViewModel {
  const content = (() => {
    if (action.request.isPending) {
      return {
        actions: {
          cancel: action.request.cancel
        },
        status: "pending"
      } satisfies AiDescriptionResultContentModel
    }

    if (action.request.errorMessage !== null) {
      return {
        actions: {
          close: action.panel.close,
          retry: action.request.retry
        },
        errorMessage: action.request.errorMessage,
        status: "error"
      } satisfies AiDescriptionResultContentModel
    }

    if (action.suggestion.text !== null) {
      return {
        actions: {
          apply: action.suggestion.apply,
          close: action.panel.close,
          openDiff: action.diff.open
        },
        result: {
          text: action.suggestion.text
        },
        status: "ready"
      } satisfies AiDescriptionResultContentModel
    }

    return {
      status: "idle"
    } satisfies AiDescriptionResultContentModel
  })()

  return {
    content,
    diff:
      action.diff.value === null
        ? null
        : {
            close: action.diff.close,
            isOpen: action.diff.isOpen,
            open: action.diff.open,
            value: action.diff.value
          },
    panel: {
      isMobile: action.panel.isMobile,
      isOpen: action.panel.isOpen,
      setOpen: action.panel.setOpen
    },
    trigger: {
      canStart: action.request.canStart,
      isPending: action.request.isPending,
      start: action.request.start
    }
  }
}

function AiDescriptionResultContent({
  content
}: AiDescriptionResultContentProps) {
  if (content.status === "pending") {
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
          onClick={content.actions.cancel}
        >
          Отменить запрос
        </Button>
      </div>
    )
  }

  if (content.status === "error") {
    return (
      <div className="space-y-4">
        <p className="text-destructive text-sm">{content.errorMessage}</p>
        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            type="button"
            onClick={() => {
              void content.actions.retry()
            }}
          >
            Повторить запрос
          </Button>
          <Button
            className="w-full"
            type="button"
            variant="outline"
            onClick={content.actions.close}
          >
            Закрыть
          </Button>
        </div>
      </div>
    )
  }

  if (content.status !== "ready") {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs">Предложенный текст</p>
        <p className="text-sm whitespace-pre-wrap">{content.result.text}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          type="button"
          onClick={content.actions.apply}
        >
          Применить
        </Button>
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={content.actions.openDiff}
        >
          Сравнить изменения
        </Button>
        <Button
          className="w-full"
          type="button"
          variant="secondary"
          onClick={content.actions.close}
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
  const viewModel = getAiDescriptionActionViewModel(action)
  const diffViewModel = viewModel.diff

  const triggerButton = (
    <Button
      className="w-full"
      disabled={!viewModel.trigger.canStart}
      type="button"
      variant="outline"
      onClick={() => {
        void viewModel.trigger.start()
      }}
    >
      {viewModel.trigger.isPending ? (
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
    <AiDescriptionResultContent content={viewModel.content} />
  )

  return (
    <>
      {viewModel.panel.isMobile ? (
        <>
          {triggerButton}
          <Sheet
            open={viewModel.panel.isOpen}
            onOpenChange={viewModel.panel.setOpen}
          >
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
        <Popover
          open={viewModel.panel.isOpen}
          onOpenChange={viewModel.panel.setOpen}
        >
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
        {diffViewModel?.isOpen ? (
          <LazyAdDiffViewer
            diff={diffViewModel.value}
            isMobile={viewModel.panel.isMobile}
            onOpenChange={nextOpen => {
              if (!nextOpen) {
                diffViewModel.close()
              }
            }}
            open={diffViewModel.isOpen}
          />
        ) : null}
      </Suspense>
    </>
  )
}

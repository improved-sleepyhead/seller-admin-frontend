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

type AiDescriptionContentStatus = AiDescriptionResultContentModel["status"]
type AiDescriptionPendingContent = Extract<
  AiDescriptionResultContentModel,
  { status: "pending" }
>
type AiDescriptionErrorContent = Extract<
  AiDescriptionResultContentModel,
  { status: "error" }
>
type AiDescriptionReadyContent = Extract<
  AiDescriptionResultContentModel,
  { status: "ready" }
>
type AiDescriptionIdleContent = Extract<
  AiDescriptionResultContentModel,
  { status: "idle" }
>
type AiDescriptionActionModel = ReturnType<typeof useAiDescriptionAction>

function getAiDescriptionReadyResult(
  action: AiDescriptionActionModel
): AiDescriptionReadyContent["result"] | null {
  if (action.suggestion.text === null) {
    return null
  }

  return {
    text: action.suggestion.text
  }
}

const AI_DESCRIPTION_CONTENT_STATUS_RULES = [
  {
    matches: ({
      action
    }: {
      action: AiDescriptionActionModel
      readyResult: AiDescriptionReadyContent["result"] | null
    }) => action.request.isPending,
    status: "pending"
  },
  {
    matches: ({
      action
    }: {
      action: AiDescriptionActionModel
      readyResult: AiDescriptionReadyContent["result"] | null
    }) => action.request.errorMessage !== null,
    status: "error"
  },
  {
    matches: ({
      readyResult
    }: {
      action: AiDescriptionActionModel
      readyResult: AiDescriptionReadyContent["result"] | null
    }) => readyResult !== null,
    status: "ready"
  }
] as const satisfies readonly {
  matches: (args: {
    action: AiDescriptionActionModel
    readyResult: AiDescriptionReadyContent["result"] | null
  }) => boolean
  status: AiDescriptionContentStatus
}[]

function getAiDescriptionContentStatus(
  action: AiDescriptionActionModel
): AiDescriptionContentStatus {
  const readyResult = getAiDescriptionReadyResult(action)

  return (
    AI_DESCRIPTION_CONTENT_STATUS_RULES.find(rule =>
      rule.matches({
        action,
        readyResult
      })
    )?.status ?? "idle"
  )
}

const AI_DESCRIPTION_CONTENT_BUILDERS = {
  error: (action: AiDescriptionActionModel): AiDescriptionErrorContent => ({
    actions: {
      close: action.panel.close,
      retry: action.request.retry
    },
    errorMessage: action.request.errorMessage ?? "",
    status: "error"
  }),
  idle: (): AiDescriptionIdleContent => ({
    status: "idle"
  }),
  pending: (action: AiDescriptionActionModel): AiDescriptionPendingContent => ({
    actions: {
      cancel: action.request.cancel
    },
    status: "pending"
  }),
  ready: (action: AiDescriptionActionModel): AiDescriptionReadyContent => ({
    actions: {
      apply: action.suggestion.apply,
      close: action.panel.close,
      openDiff: action.diff.open
    },
    result: getAiDescriptionReadyResult(action) ?? {
      text: ""
    },
    status: "ready"
  })
} satisfies {
  [Status in AiDescriptionContentStatus]: (
    action: AiDescriptionActionModel
  ) => Extract<AiDescriptionResultContentModel, { status: Status }>
}

function getAiDescriptionActionViewModel(
  action: AiDescriptionActionModel
): AiDescriptionActionViewModel {
  const contentStatus = getAiDescriptionContentStatus(action)
  const content = AI_DESCRIPTION_CONTENT_BUILDERS[contentStatus](action)

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

function AiDescriptionPendingResultContent({
  content
}: {
  content: AiDescriptionPendingContent
}) {
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

function AiDescriptionErrorResultContent({
  content
}: {
  content: AiDescriptionErrorContent
}) {
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

function AiDescriptionReadyResultContent({
  content
}: {
  content: AiDescriptionReadyContent
}) {
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

function AiDescriptionIdleResultContent({
  content
}: {
  content: AiDescriptionIdleContent
}) {
  void content

  return null
}

const AI_DESCRIPTION_RESULT_CONTENT_COMPONENTS = {
  error: AiDescriptionErrorResultContent,
  idle: AiDescriptionIdleResultContent,
  pending: AiDescriptionPendingResultContent,
  ready: AiDescriptionReadyResultContent
} satisfies {
  [Status in AiDescriptionContentStatus]: (props: {
    content: Extract<AiDescriptionResultContentModel, { status: Status }>
  }) => ReturnType<typeof AiDescriptionPendingResultContent> | null
}

function AiDescriptionResultContent({
  content
}: AiDescriptionResultContentProps) {
  const ContentComponent = AI_DESCRIPTION_RESULT_CONTENT_COMPONENTS[
    content.status
  ] as (props: {
    content: AiDescriptionResultContentModel
  }) => ReturnType<typeof AiDescriptionPendingResultContent> | null

  return <ContentComponent content={content} />
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

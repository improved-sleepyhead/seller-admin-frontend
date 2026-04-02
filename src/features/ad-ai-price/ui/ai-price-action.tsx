import { Loader2Icon } from "lucide-react"

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

import { useAiPriceAction, type AdEditFormApi } from "../model"

interface AiPriceActionProps {
  disabled: boolean
  form: AdEditFormApi | null
}

interface AiPricePanelViewModel {
  close: () => void
  isMobile: boolean
  isOpen: boolean
  setOpen: (nextOpen: boolean) => void
}

interface AiPriceTriggerViewModel {
  canStart: boolean
  isPending: boolean
  start: () => Promise<void>
}

type AiPriceResultContentModel =
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
        retry: () => Promise<void>
      }
      result: {
        priceLabel: string
        reasoning: string
      }
      status: "ready"
    }
  | {
      status: "idle"
    }

interface AiPriceActionViewModel {
  content: AiPriceResultContentModel
  panel: AiPricePanelViewModel
  trigger: AiPriceTriggerViewModel
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    currency: "RUB",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value)
}

interface AiPriceResultContentProps {
  content: AiPriceResultContentModel
}

type AiPriceContentStatus = AiPriceResultContentModel["status"]
type AiPricePendingContent = Extract<
  AiPriceResultContentModel,
  { status: "pending" }
>
type AiPriceErrorContent = Extract<
  AiPriceResultContentModel,
  { status: "error" }
>
type AiPriceReadyContent = Extract<
  AiPriceResultContentModel,
  { status: "ready" }
>
type AiPriceIdleContent = Extract<AiPriceResultContentModel, { status: "idle" }>
type AiPriceActionModel = ReturnType<typeof useAiPriceAction>

function getAiPriceReadyResult(
  action: AiPriceActionModel
): AiPriceReadyContent["result"] | null {
  const response = action.suggestion.response

  if (
    response?.suggestedPrice === undefined ||
    response.reasoning === undefined
  ) {
    return null
  }

  return {
    priceLabel: formatPrice(response.suggestedPrice),
    reasoning: response.reasoning
  }
}

const AI_PRICE_CONTENT_STATUS_RULES = [
  {
    matches: ({
      action
    }: {
      action: AiPriceActionModel
      readyResult: AiPriceReadyContent["result"] | null
    }) => action.request.isPending,
    status: "pending"
  },
  {
    matches: ({
      action
    }: {
      action: AiPriceActionModel
      readyResult: AiPriceReadyContent["result"] | null
    }) => action.request.errorMessage !== null,
    status: "error"
  },
  {
    matches: ({
      readyResult
    }: {
      action: AiPriceActionModel
      readyResult: AiPriceReadyContent["result"] | null
    }) => readyResult !== null,
    status: "ready"
  }
] as const satisfies readonly {
  matches: (args: {
    action: AiPriceActionModel
    readyResult: AiPriceReadyContent["result"] | null
  }) => boolean
  status: AiPriceContentStatus
}[]

function getAiPriceContentStatus(
  action: AiPriceActionModel
): AiPriceContentStatus {
  const readyResult = getAiPriceReadyResult(action)

  return (
    AI_PRICE_CONTENT_STATUS_RULES.find(rule =>
      rule.matches({
        action,
        readyResult
      })
    )?.status ?? "idle"
  )
}

const AI_PRICE_CONTENT_BUILDERS = {
  error: (action: AiPriceActionModel): AiPriceErrorContent => ({
    actions: {
      close: action.panel.close,
      retry: action.request.retry
    },
    errorMessage: action.request.errorMessage ?? "",
    status: "error"
  }),
  idle: (): AiPriceIdleContent => ({
    status: "idle"
  }),
  pending: (action: AiPriceActionModel): AiPricePendingContent => ({
    actions: {
      cancel: action.request.cancel
    },
    status: "pending"
  }),
  ready: (action: AiPriceActionModel): AiPriceReadyContent => ({
    actions: {
      apply: action.suggestion.apply,
      close: action.panel.close,
      retry: action.request.retry
    },
    result: getAiPriceReadyResult(action) ?? {
      priceLabel: "",
      reasoning: ""
    },
    status: "ready"
  })
} satisfies {
  [Status in AiPriceContentStatus]: (
    action: AiPriceActionModel
  ) => Extract<AiPriceResultContentModel, { status: Status }>
}

function getAiPriceActionViewModel(
  action: AiPriceActionModel
): AiPriceActionViewModel {
  const contentStatus = getAiPriceContentStatus(action)
  const content = AI_PRICE_CONTENT_BUILDERS[contentStatus](action)

  return {
    content,
    panel: action.panel,
    trigger: {
      canStart: action.request.canStart,
      isPending: action.request.isPending,
      start: action.request.start
    }
  }
}

function AiPricePendingResultContent({
  content
}: {
  content: AiPricePendingContent
}) {
  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-sm">
        <Loader2Icon className="size-4 animate-spin" />
        Подбираем рекомендованную цену...
      </p>
      <div className="flex gap-2">
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={content.actions.cancel}
        >
          Отменить запрос
        </Button>
      </div>
    </div>
  )
}

function AiPriceErrorResultContent({
  content
}: {
  content: AiPriceErrorContent
}) {
  return (
    <div className="space-y-4">
      <p className="text-destructive text-sm">{content.errorMessage}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="w-full"
          type="button"
          variant="default"
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

function AiPriceReadyResultContent({
  content
}: {
  content: AiPriceReadyContent
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs">Предложенная цена</p>
        <p className="text-lg font-semibold">{content.result.priceLabel}</p>
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs">Обоснование</p>
        <p className="text-sm">{content.result.reasoning}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          type="button"
          onClick={content.actions.apply}
        >
          Применить цену
        </Button>
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={content.actions.close}
        >
          Оставить текущую
        </Button>
      </div>
      <Button
        className="w-full"
        type="button"
        variant="secondary"
        onClick={() => {
          void content.actions.retry()
        }}
      >
        Повторить запрос
      </Button>
    </div>
  )
}

function AiPriceIdleResultContent({
  content
}: {
  content: AiPriceIdleContent
}) {
  void content

  return null
}

const AI_PRICE_RESULT_CONTENT_COMPONENTS = {
  error: AiPriceErrorResultContent,
  idle: AiPriceIdleResultContent,
  pending: AiPricePendingResultContent,
  ready: AiPriceReadyResultContent
} satisfies {
  [Status in AiPriceContentStatus]: (props: {
    content: Extract<AiPriceResultContentModel, { status: Status }>
  }) => ReturnType<typeof AiPricePendingResultContent> | null
}

function AiPriceResultContent({ content }: AiPriceResultContentProps) {
  const ContentComponent = AI_PRICE_RESULT_CONTENT_COMPONENTS[
    content.status
  ] as (props: {
    content: AiPriceResultContentModel
  }) => ReturnType<typeof AiPricePendingResultContent> | null

  return <ContentComponent content={content} />
}

export function AiPriceAction({ disabled, form }: AiPriceActionProps) {
  const action = useAiPriceAction({
    disabled,
    form
  })
  const viewModel = getAiPriceActionViewModel(action)

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
          Подбираем цену...
        </>
      ) : (
        "Предложить цену"
      )}
    </Button>
  )

  const panelContent = <AiPriceResultContent content={viewModel.content} />

  if (viewModel.panel.isMobile) {
    return (
      <>
        {triggerButton}
        <Sheet
          open={viewModel.panel.isOpen}
          onOpenChange={viewModel.panel.setOpen}
        >
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>AI-предложение цены</SheetTitle>
              <SheetDescription>
                Оценка формируется на основе текущих данных объявления.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4">{panelContent}</div>
            <SheetFooter />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <Popover
      open={viewModel.panel.isOpen}
      onOpenChange={viewModel.panel.setOpen}
    >
      <PopoverAnchor asChild>{triggerButton}</PopoverAnchor>
      <PopoverContent align="start" className="w-[24rem] space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">AI-предложение цены</h3>
          <p className="text-muted-foreground text-xs">
            Оценка формируется на основе текущих данных объявления.
          </p>
        </div>
        {panelContent}
      </PopoverContent>
    </Popover>
  )
}

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

function getAiPriceActionViewModel(
  action: ReturnType<typeof useAiPriceAction>
): AiPriceActionViewModel {
  const response = action.suggestion.response
  const content = (() => {
    if (action.request.isPending) {
      return {
        actions: {
          cancel: action.request.cancel
        },
        status: "pending"
      } satisfies AiPriceResultContentModel
    }

    if (action.request.errorMessage !== null) {
      return {
        actions: {
          close: action.panel.close,
          retry: action.request.retry
        },
        errorMessage: action.request.errorMessage,
        status: "error"
      } satisfies AiPriceResultContentModel
    }

    if (
      response?.suggestedPrice !== undefined &&
      response.reasoning !== undefined
    ) {
      return {
        actions: {
          apply: action.suggestion.apply,
          close: action.panel.close,
          retry: action.request.retry
        },
        result: {
          priceLabel: formatPrice(response.suggestedPrice),
          reasoning: response.reasoning
        },
        status: "ready"
      } satisfies AiPriceResultContentModel
    }

    return {
      status: "idle"
    } satisfies AiPriceResultContentModel
  })()

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

function AiPriceResultContent({ content }: AiPriceResultContentProps) {
  if (content.status === "pending") {
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

  if (content.status === "error") {
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

  if (content.status !== "ready") {
    return null
  }

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

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

function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    currency: "RUB",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value)
}

interface AiPriceResultContentProps {
  action: ReturnType<typeof useAiPriceAction>
}

function AiPriceResultContent({ action }: AiPriceResultContentProps) {
  if (action.request.isPending) {
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
            onClick={action.request.cancel}
          >
            Отменить запрос
          </Button>
        </div>
      </div>
    )
  }

  if (action.request.errorMessage !== null) {
    return (
      <div className="space-y-4">
        <p className="text-destructive text-sm">
          {action.request.errorMessage}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="w-full"
            type="button"
            variant="default"
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

  if (
    action.suggestion.response?.suggestedPrice === undefined ||
    action.suggestion.response.reasoning === undefined
  ) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs">Предложенная цена</p>
        <p className="text-lg font-semibold">
          {formatPrice(action.suggestion.response.suggestedPrice)}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs">Обоснование</p>
        <p className="text-sm">{action.suggestion.response.reasoning}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          type="button"
          onClick={action.suggestion.apply}
        >
          Применить цену
        </Button>
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={action.panel.close}
        >
          Оставить текущую
        </Button>
      </div>
      <Button
        className="w-full"
        type="button"
        variant="secondary"
        onClick={() => {
          void action.request.retry()
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
          Подбираем цену...
        </>
      ) : (
        "Предложить цену"
      )}
    </Button>
  )

  const panelContent = <AiPriceResultContent action={action} />

  if (action.panel.isMobile) {
    return (
      <>
        {triggerButton}
        <Sheet open={action.panel.isOpen} onOpenChange={action.panel.setOpen}>
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
    <Popover open={action.panel.isOpen} onOpenChange={action.panel.setOpen}>
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

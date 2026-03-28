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
  applySuggestion: () => void
  cancelRequest: () => void
  closeResult: () => void
  errorMessage: string | null
  isPending: boolean
  responsePrice: number | null
  responseReasoning: string | null
  retrySuggestion: () => Promise<void>
}

function AiPriceResultContent({
  applySuggestion,
  cancelRequest,
  closeResult,
  errorMessage,
  isPending,
  responsePrice,
  responseReasoning,
  retrySuggestion
}: AiPriceResultContentProps) {
  if (isPending) {
    return (
      <div className="space-y-4">
        <p className="text-sm">Подбираем рекомендованную цену...</p>
        <div className="flex gap-2">
          <Button
            className="w-full"
            type="button"
            variant="outline"
            onClick={cancelRequest}
          >
            Отменить запрос
          </Button>
        </div>
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
            variant="default"
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

  if (responsePrice === null || responseReasoning === null) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs">Предложенная цена</p>
        <p className="text-lg font-semibold">{formatPrice(responsePrice)}</p>
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs">Обоснование</p>
        <p className="text-sm">{responseReasoning}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Button className="w-full" type="button" onClick={applySuggestion}>
          Применить цену
        </Button>
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={closeResult}
        >
          Оставить текущую
        </Button>
      </div>
      <Button
        className="w-full"
        type="button"
        variant="secondary"
        onClick={() => {
          void retrySuggestion()
        }}
      >
        Повторить запрос
      </Button>
    </div>
  )
}

export function AiPriceAction({ disabled, form }: AiPriceActionProps) {
  const {
    applySuggestion,
    canRequestSuggestion,
    cancelRequest,
    closeResult,
    errorMessage,
    isMobile,
    isPending,
    isResultOpen,
    requestSuggestion,
    response,
    retrySuggestion,
    setResultOpen
  } = useAiPriceAction({
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
          Подбираем цену...
        </>
      ) : (
        "Предложить цену"
      )}
    </Button>
  )

  const panelContent = (
    <AiPriceResultContent
      applySuggestion={applySuggestion}
      cancelRequest={cancelRequest}
      closeResult={closeResult}
      errorMessage={errorMessage}
      isPending={isPending}
      responsePrice={response?.suggestedPrice ?? null}
      responseReasoning={response?.reasoning ?? null}
      retrySuggestion={retrySuggestion}
    />
  )

  if (isMobile) {
    return (
      <>
        {triggerButton}
        <Sheet open={isResultOpen} onOpenChange={setResultOpen}>
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
    <Popover open={isResultOpen} onOpenChange={setResultOpen}>
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

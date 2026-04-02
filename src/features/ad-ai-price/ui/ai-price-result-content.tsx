import { Loader2Icon } from "lucide-react"

import { Button } from "@/shared/ui/shadcn"

import type {
  AiPriceContentStatus,
  AiPriceErrorContent,
  AiPriceIdleContent,
  AiPricePendingContent,
  AiPriceReadyContent,
  AiPriceResultContentModel,
  AiPriceResultContentProps
} from "./ai-price-action.contract"

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

export { AiPriceResultContent }

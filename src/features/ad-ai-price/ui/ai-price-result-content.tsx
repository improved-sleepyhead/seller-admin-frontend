import { Loader } from "@/shared/ui/loader"
import { Button } from "@/shared/ui/shadcn"

import type {
  ContentModel,
  ContentProps,
  ContentStatus,
  ErrorContent,
  IdleContent,
  PendingContent,
  ReadyContent
} from "./ai-price-action.contract"

function PendingView({ content }: { content: PendingContent }) {
  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-sm">
        <Loader />
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

function ErrorView({ content }: { content: ErrorContent }) {
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

function ReadyView({ content }: { content: ReadyContent }) {
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

function IdleView({ content }: { content: IdleContent }) {
  void content

  return null
}

const RESULT_VIEWS = {
  error: ErrorView,
  idle: IdleView,
  pending: PendingView,
  ready: ReadyView
} satisfies {
  [Status in ContentStatus]: (props: {
    content: Extract<ContentModel, { status: Status }>
  }) => ReturnType<typeof PendingView> | null
}

function ResultContent({ content }: ContentProps) {
  const ContentView = RESULT_VIEWS[content.status] as (props: {
    content: ContentModel
  }) => ReturnType<typeof PendingView> | null

  return <ContentView content={content} />
}

export { ResultContent }

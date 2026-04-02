import { Loader2Icon } from "lucide-react"

import { Button } from "@/shared/ui/shadcn"

import type {
  AiDescriptionContentStatus,
  AiDescriptionErrorContent,
  AiDescriptionIdleContent,
  AiDescriptionPendingContent,
  AiDescriptionReadyContent,
  AiDescriptionResultContentModel,
  AiDescriptionResultContentProps
} from "./ai-description-action.contract"

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

export { AiDescriptionResultContent }

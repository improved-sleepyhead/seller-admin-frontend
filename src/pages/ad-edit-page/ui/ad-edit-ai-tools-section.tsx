import { lazy, memo, Suspense } from "react"

import { Loader } from "@/shared/ui/loader"
import { Badge } from "@/shared/ui/shadcn"
import { AiChatPanel } from "@/widgets/ai-chat-panel"

import type { AiToolsSectionProps } from "../model"

const LazyAdAiChat = lazy(async () => {
  const module = await import("@/features/ad-ai-chat")

  return { default: module.AdAiChat }
})

function AiChatLoadingState() {
  return (
    <div className="bg-background text-muted-foreground flex min-h-0 flex-1 items-center justify-center gap-2 rounded-2xl border text-sm">
      <Loader />
      Загружаем AI чат...
    </div>
  )
}

export const AdEditAiToolsSection = memo(function AdEditAiToolsSection({
  adId,
  ai,
  form
}: AiToolsSectionProps) {
  return (
    <AiChatPanel
      disabled={!ai.chatEnabled}
      statusContent={
        <div className="space-y-2">
          <Badge variant={ai.badgeVariant}>{ai.label}</Badge>
          <p className="text-muted-foreground text-sm">{ai.message}</p>
          <p className="text-muted-foreground text-sm">Модель: {ai.model}</p>
        </div>
      }
    >
      <Suspense fallback={<AiChatLoadingState />}>
        <LazyAdAiChat disabled={!ai.chatEnabled} form={form} itemId={adId} />
      </Suspense>
    </AiChatPanel>
  )
})

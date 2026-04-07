import { memo } from "react"

import { AdAiChat } from "@/features/ad-ai-chat"
import { Badge } from "@/shared/ui/shadcn"
import { AiChatPanel } from "@/widgets/ai-chat-panel"

import type { AiToolsSectionProps } from "../model"

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
      <AdAiChat disabled={!ai.chatEnabled} form={form} itemId={adId} />
    </AiChatPanel>
  )
})

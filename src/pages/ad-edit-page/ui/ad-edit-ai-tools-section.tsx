import { memo } from "react"

import { AdAiChat } from "@/features/ad-ai-chat"
import { AiDescriptionAction } from "@/features/ad-ai-description"
import { AiPriceAction } from "@/features/ad-ai-price"
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/shared/ui/shadcn"
import { AiChatPanel } from "@/widgets/ai-chat-panel"

import type { AdEditAiToolsSectionProps } from "../model"

export const AdEditAiToolsSection = memo(function AdEditAiToolsSection({
  adId,
  ai,
  form
}: AdEditAiToolsSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI инструменты</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AiDescriptionAction disabled={!ai.descriptionEnabled} form={form} />
          <AiPriceAction disabled={!ai.priceEnabled} form={form} />
          <div className="space-y-2">
            <Badge variant={ai.badgeVariant}>{ai.label}</Badge>
            <p className="text-muted-foreground text-sm">{ai.message}</p>
            <p className="text-muted-foreground text-sm">Модель: {ai.model}</p>
          </div>
        </CardContent>
      </Card>

      <AiChatPanel disabled={!ai.chatEnabled}>
        <AdAiChat disabled={!ai.chatEnabled} form={form} itemId={adId} />
      </AiChatPanel>
    </div>
  )
})

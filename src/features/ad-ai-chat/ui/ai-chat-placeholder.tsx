import { Badge } from "@/shared/ui/shadcn"

interface AiChatPlaceholderProps {
  enabled: boolean
}

export function AiChatPlaceholder({ enabled }: AiChatPlaceholderProps) {
  return (
    <div className="space-y-3">
      <Badge variant={enabled ? "default" : "secondary"}>
        {enabled ? "AI чат доступен" : "AI чат недоступен"}
      </Badge>
      <p className="text-muted-foreground text-sm">
        Панель чата будет подключена в следующих задачах.
      </p>
    </div>
  )
}

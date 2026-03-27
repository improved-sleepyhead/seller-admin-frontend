import { Badge, Button } from "@/shared/ui/shadcn"

interface AiChatPlaceholderProps {
  enabled: boolean
}

export function AiChatPlaceholder({ enabled }: AiChatPlaceholderProps) {
  return (
    <div className="space-y-3">
      <Badge variant={enabled ? "default" : "secondary"}>
        {enabled ? "AI чат доступен" : "AI чат недоступен"}
      </Badge>
      <Button
        className="w-full"
        disabled={!enabled}
        type="button"
        variant="outline"
      >
        Открыть AI чат
      </Button>
      <p className="text-muted-foreground text-sm">
        Полная функциональность чата будет подключена в следующих задачах.
      </p>
    </div>
  )
}

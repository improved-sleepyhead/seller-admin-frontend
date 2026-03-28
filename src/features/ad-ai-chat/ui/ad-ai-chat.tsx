import { Loader2Icon } from "lucide-react"

import { type AdEditFormApi, type AiChatMessage } from "@/entities/ad"
import { cn } from "@/shared/lib/cn"
import { Badge, Button, Textarea } from "@/shared/ui/shadcn"

import { useAiChat } from "../model"

interface AdAiChatProps {
  disabled: boolean
  form: AdEditFormApi | null
  itemId: number
}

function getRoleLabel(role: AiChatMessage["role"]): string {
  if (role === "assistant") {
    return "AI"
  }

  if (role === "user") {
    return "Вы"
  }

  return "Система"
}

function getStatusLabel(status: AiChatMessage["status"]): string {
  if (status === "streaming") {
    return "Печатает..."
  }

  if (status === "error") {
    return "Ошибка"
  }

  return "Готово"
}

function getStatusBadgeVariant(status: AiChatMessage["status"]) {
  if (status === "error") {
    return "destructive" as const
  }

  if (status === "streaming") {
    return "secondary" as const
  }

  return "outline" as const
}

function ChatMessageItem({ message }: { message: AiChatMessage }) {
  const isUser = message.role === "user"

  return (
    <article
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
      data-testid={`ai-chat-message-${message.role}`}
    >
      <div
        className={cn(
          "max-w-[90%] space-y-2 rounded-md border px-3 py-2 text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium">{getRoleLabel(message.role)}</p>
          <Badge variant={getStatusBadgeVariant(message.status)}>
            {getStatusLabel(message.status)}
          </Badge>
        </div>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </article>
  )
}

export function AdAiChat({ disabled, form, itemId }: AdAiChatProps) {
  const {
    canRetry,
    canSubmit,
    cancelStreaming,
    inlineError,
    inputValue,
    isPending,
    messages,
    retryLastMessage,
    sendMessage,
    setInputValue
  } = useAiChat({
    disabled,
    form,
    itemId
  })

  return (
    <div className="space-y-4">
      <div
        aria-live="polite"
        className="max-h-80 space-y-3 overflow-y-auto rounded-md border p-3"
        data-testid="ai-chat-messages"
      >
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            История чата пуста. Задайте вопрос по объявлению.
          </p>
        ) : (
          messages.map(message => (
            <ChatMessageItem key={message.id} message={message} />
          ))
        )}
      </div>

      {inlineError !== null ? (
        <div
          className="bg-destructive/10 space-y-2 rounded-md border border-red-500/40 p-3"
          data-testid="ai-chat-error"
        >
          <p className="text-destructive text-sm">{inlineError}</p>
          {canRetry ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void retryLastMessage()
              }}
            >
              Повторить
            </Button>
          ) : null}
        </div>
      ) : null}

      <form
        className="space-y-3"
        onSubmit={event => {
          event.preventDefault()
          void sendMessage()
        }}
      >
        <Textarea
          disabled={disabled || isPending || form === null}
          placeholder={
            disabled
              ? "AI чат недоступен"
              : "Напишите сообщение для AI помощника..."
          }
          rows={3}
          value={inputValue}
          onChange={event => {
            setInputValue(event.target.value)
          }}
        />
        <div className="flex items-center justify-end gap-2">
          {isPending ? (
            <Button type="button" variant="outline" onClick={cancelStreaming}>
              Отменить
            </Button>
          ) : null}

          <Button disabled={!canSubmit} type="submit">
            {isPending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Генерируем...
              </>
            ) : (
              "Отправить"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

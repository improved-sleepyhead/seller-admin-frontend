import { useEffect, useRef } from "react"

import { type AdEditFormApi } from "@/entities/ad/model"
import { cn } from "@/shared/lib/cn"
import { Loader } from "@/shared/ui/loader"
import { Button, Label, Textarea } from "@/shared/ui/shadcn"

import { useAdAiChatModel } from "../model"

import type { UIMessage } from "ai"

interface AdAiChatProps {
  disabled: boolean
  form: AdEditFormApi | null
  itemId: number
}

const AI_CHAT_ROLE_LABELS = {
  assistant: "AI",
  system: "Система",
  user: "Вы"
} satisfies Record<UIMessage["role"], string>

function getRoleLabel(role: UIMessage["role"]): string {
  return AI_CHAT_ROLE_LABELS[role]
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .flatMap(part => {
      if (part.type !== "text" || part.text.trim().length === 0) {
        return []
      }

      return [part.text]
    })
    .join("")
}

function ChatMessageItem({ message }: { message: UIMessage }) {
  const isUser = message.role === "user"
  const messageText = getMessageText(message)

  if (messageText.trim().length === 0) {
    return null
  }

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
        <p className="text-xs font-medium">{getRoleLabel(message.role)}</p>
        <p className="whitespace-pre-wrap">{messageText}</p>
      </div>
    </article>
  )
}

export function AdAiChat({ disabled, form, itemId }: AdAiChatProps) {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const {
    canRetry,
    canSubmit,
    inlineError,
    inputValue,
    isPending,
    messages,
    retryLastMessage,
    sendMessage,
    setInputValue,
    stopStreaming
  } = useAdAiChatModel({
    disabled,
    form,
    itemId
  })
  const chatInputId = `ad-ai-chat-input-${itemId}`
  const chatErrorId = `ad-ai-chat-error-${itemId}`
  const hasInlineError = inlineError !== null

  useEffect(() => {
    const container = messagesContainerRef.current

    if (container === null) {
      return
    }

    if (typeof container.scrollTo === "function") {
      container.scrollTo({
        behavior: "smooth",
        top: container.scrollHeight
      })
      return
    }

    container.scrollTop = container.scrollHeight
  }, [messages])

  return (
    <div className="space-y-4">
      <div
        aria-live="polite"
        aria-relevant="additions text"
        className="max-h-80 space-y-3 overflow-y-auto rounded-md border p-3"
        data-testid="ai-chat-messages"
        ref={messagesContainerRef}
        role="log"
      >
        {messages.every(
          message => getMessageText(message).trim().length === 0
        ) ? (
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
          id={chatErrorId}
          aria-live="assertive"
          className="bg-destructive/10 space-y-2 rounded-md border border-red-500/40 p-3"
          data-testid="ai-chat-error"
          role="alert"
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
        <Label className="sr-only" htmlFor={chatInputId}>
          Сообщение для AI чата
        </Label>
        <Textarea
          aria-describedby={hasInlineError ? chatErrorId : undefined}
          aria-invalid={hasInlineError}
          disabled={disabled || isPending || form === null}
          id={chatInputId}
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
          onKeyDown={event => {
            if (
              event.key !== "Enter" ||
              event.shiftKey ||
              event.nativeEvent.isComposing
            ) {
              return
            }

            event.preventDefault()
            void sendMessage()
          }}
        />
        <div className="flex items-center justify-end gap-2">
          {isPending ? (
            <Button type="button" variant="outline" onClick={stopStreaming}>
              Отменить
            </Button>
          ) : null}

          <Button disabled={!canSubmit} type="submit">
            {isPending ? (
              <>
                <Loader />
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

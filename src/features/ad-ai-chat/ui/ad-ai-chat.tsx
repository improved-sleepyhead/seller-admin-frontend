import { type AdEditFormApi } from "@/entities/ad/model"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
  Message,
  MessageContent,
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea
} from "@/shared/ui/ai-elements"
import { Button, Label } from "@/shared/ui/shadcn"

import { useAdAiChatModel } from "../model"

import type { UIMessage } from "ai"

interface AdAiChatProps {
  disabled: boolean
  form: AdEditFormApi | null
  itemId: number
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

export function AdAiChat({ disabled, form, itemId }: AdAiChatProps) {
  const {
    canRetry,
    canSubmit,
    clearInlineError,
    inlineError,
    inputValue,
    isPending,
    messages,
    retryLastMessage,
    sendMessage,
    setInputValue,
    status,
    stopStreaming
  } = useAdAiChatModel({
    disabled,
    form,
    itemId
  })
  const chatInputId = `ad-ai-chat-input-${itemId}`
  const chatErrorId = `ad-ai-chat-error-${itemId}`
  const hasInlineError = inlineError !== null
  const isChatEmpty = messages.every(
    message => getMessageText(message).trim().length === 0
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <Conversation
        className="bg-background min-h-0 flex-1 overflow-y-auto rounded-2xl border"
        data-testid="ai-chat-messages"
      >
        <ConversationContent className="gap-3 p-4">
          {isChatEmpty ? (
            <ConversationEmptyState
              description="Задайте вопрос по текущему объявлению."
              title="История чата пуста"
            />
          ) : (
            messages.map(message => {
              const messageText = getMessageText(message)

              if (messageText.trim().length === 0) {
                return null
              }

              return (
                <Message
                  data-testid={`ai-chat-message-${message.role}`}
                  from={message.role}
                  key={message.id}
                >
                  <MessageContent>
                    <p className="whitespace-pre-wrap">{messageText}</p>
                  </MessageContent>
                </Message>
              )
            })
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {inlineError !== null ? (
        <div
          id={chatErrorId}
          aria-live="assertive"
          className="bg-destructive/10 space-y-2 rounded-xl border border-red-500/40 p-3"
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

      <Label className="sr-only" htmlFor={chatInputId}>
        Сообщение для AI чата
      </Label>

      <PromptInput
        className="bg-background shrink-0 rounded-2xl border p-2 shadow-xs"
        onSubmit={(message, event) => {
          event.preventDefault()
          void sendMessage(message.text)
        }}
      >
        <PromptInputTextarea
          aria-describedby={hasInlineError ? chatErrorId : undefined}
          aria-invalid={hasInlineError}
          className="max-h-40 min-h-14 border-0 bg-transparent pr-12 shadow-none focus-visible:ring-0"
          disabled={disabled || isPending || form === null}
          id={chatInputId}
          maxLength={1200}
          placeholder={
            disabled
              ? "AI чат недоступен"
              : "Спросите, что улучшить в объявлении..."
          }
          value={inputValue}
          onChange={event => {
            if (hasInlineError) {
              clearInlineError()
            }

            setInputValue(event.target.value)
          }}
        />
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit
            aria-label={
              isPending ? "Остановить ответ AI" : "Отправить сообщение"
            }
            className="rounded-full"
            disabled={disabled || form === null || (!canSubmit && !isPending)}
            onStop={stopStreaming}
            status={status}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}

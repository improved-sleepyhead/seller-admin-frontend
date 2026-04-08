"use client"

import { ArrowDownIcon } from "lucide-react"
import { useCallback, type ComponentProps, type ReactNode } from "react"
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom"

import { cn } from "@/shared/lib/cn"
import { Button } from "@/shared/ui/shadcn"

export type ConversationProps = ComponentProps<typeof StickToBottom>

export function Conversation({ className, ...props }: ConversationProps) {
  return (
    <StickToBottom
      className={cn("relative flex-1 overflow-y-hidden", className)}
      initial="smooth"
      resize="smooth"
      role="log"
      {...props}
    />
  )
}

export type ConversationContentProps = ComponentProps<
  typeof StickToBottom.Content
>

export function ConversationContent({
  className,
  ...props
}: ConversationContentProps) {
  return (
    <StickToBottom.Content
      className={cn("flex flex-col gap-4 p-4", className)}
      {...props}
    />
  )
}

export interface ConversationEmptyStateProps extends ComponentProps<"div"> {
  description?: string
  icon?: ReactNode
  title?: string
}

export function ConversationEmptyState({
  children,
  className,
  description = "Start a conversation to see messages here.",
  icon,
  title = "No messages yet",
  ...props
}: ConversationEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          {icon ? <div className="text-muted-foreground">{icon}</div> : null}
          <div className="space-y-1">
            <h3 className="text-sm font-medium">{title}</h3>
            {description ? (
              <p className="text-muted-foreground text-sm">{description}</p>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}

export type ConversationScrollButtonProps = Omit<
  ComponentProps<typeof Button>,
  "onClick"
>

export function ConversationScrollButton({
  className,
  ...props
}: ConversationScrollButtonProps) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext()
  const handleScrollToBottom = useCallback(() => {
    void scrollToBottom()
  }, [scrollToBottom])

  if (isAtBottom) {
    return null
  }

  return (
    <Button
      className={cn(
        "absolute right-4 bottom-4 rounded-full shadow-sm",
        className
      )}
      onClick={handleScrollToBottom}
      size="icon"
      type="button"
      variant="outline"
      {...props}
    >
      <ArrowDownIcon className="size-4" />
      <span className="sr-only">Прокрутить вниз</span>
    </Button>
  )
}

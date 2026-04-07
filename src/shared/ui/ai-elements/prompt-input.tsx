"use client"

import { CornerDownLeftIcon, Loader2Icon, SquareIcon } from "lucide-react"
import { useCallback, type ComponentProps, type FormEventHandler } from "react"

import { cn } from "@/shared/lib/cn"
import {
  InputGroup,
  InputGroupButton,
  InputGroupTextarea
} from "@/shared/ui/shadcn"

import type { ChatStatus } from "ai"

export interface PromptInputMessage {
  text: string
}

export interface PromptInputProps extends Omit<
  ComponentProps<"form">,
  "onSubmit"
> {
  onSubmit: (
    message: PromptInputMessage,
    event: React.FormEvent<HTMLFormElement>
  ) => void | Promise<void>
}

export function PromptInput({
  children,
  className,
  onSubmit,
  ...props
}: PromptInputProps) {
  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    event => {
      event.preventDefault()

      const form = event.currentTarget
      const formData = new FormData(form)
      const rawText = formData.get("message")
      const text = typeof rawText === "string" ? rawText : ""

      void onSubmit({ text }, event)
    },
    [onSubmit]
  )

  return (
    <form
      className={cn("bg-background rounded-2xl border shadow-xs", className)}
      noValidate
      onSubmit={handleSubmit}
      {...props}
    >
      <InputGroup className="h-auto min-h-0 items-end border-0 bg-transparent shadow-none">
        {children}
      </InputGroup>
    </form>
  )
}

export type PromptInputTextareaProps = ComponentProps<typeof InputGroupTextarea>

export function PromptInputTextarea({
  className,
  onKeyDown,
  placeholder = "Ask anything",
  ...props
}: PromptInputTextareaProps) {
  return (
    <InputGroupTextarea
      className={cn("max-h-48 min-h-14 resize-none", className)}
      name="message"
      placeholder={placeholder}
      onKeyDown={event => {
        onKeyDown?.(event)

        if (
          event.defaultPrevented ||
          event.key !== "Enter" ||
          event.shiftKey ||
          event.nativeEvent.isComposing
        ) {
          return
        }

        event.preventDefault()
        event.currentTarget.form?.requestSubmit()
      }}
      {...props}
    />
  )
}

export type PromptInputFooterProps = ComponentProps<"div">

export function PromptInputFooter({
  children,
  className,
  ...props
}: PromptInputFooterProps) {
  return (
    <div
      className={cn("flex items-center justify-end px-2 pb-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export interface PromptInputSubmitProps extends Omit<
  ComponentProps<typeof InputGroupButton>,
  "type"
> {
  onStop?: () => void
  status?: ChatStatus
}

export function PromptInputSubmit({
  children,
  className,
  onClick,
  onStop,
  size = "icon-sm",
  status,
  variant = "default",
  ...props
}: PromptInputSubmitProps) {
  const isGenerating = status === "submitted" || status === "streaming"

  return (
    <InputGroupButton
      className={cn("rounded-full", className)}
      onClick={event => {
        if (isGenerating && onStop) {
          event.preventDefault()
          onStop()
          return
        }

        onClick?.(event)
      }}
      size={size}
      type={isGenerating && onStop ? "button" : "submit"}
      variant={variant}
      {...props}
    >
      {children ??
        (status === "submitted" ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : status === "streaming" ? (
          <SquareIcon className="size-4" />
        ) : (
          <CornerDownLeftIcon className="size-4" />
        ))}
    </InputGroupButton>
  )
}

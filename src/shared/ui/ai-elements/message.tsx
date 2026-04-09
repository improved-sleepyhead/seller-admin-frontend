import { cn } from "@/shared/lib/cn"

import type { UIMessage } from "ai"
import type { HTMLAttributes } from "react"

export interface MessageProps extends HTMLAttributes<HTMLDivElement> {
  from: UIMessage["role"]
}

export function Message({ className, from, ...props }: MessageProps) {
  return (
    <div
      className={cn(
        "group flex w-full max-w-[92%] flex-col gap-2",
        from === "user" ? "ml-auto items-end" : "items-start",
        className
      )}
      {...props}
    />
  )
}

export type MessageContentProps = HTMLAttributes<HTMLDivElement>

export function MessageContent({
  children,
  className,
  ...props
}: MessageContentProps) {
  return (
    <div
      className={cn(
        "w-fit max-w-full overflow-hidden text-sm",
        "group-[.ml-auto]:bg-primary group-[.ml-auto]:text-primary-foreground group-[.ml-auto]:rounded-[1.25rem] group-[.ml-auto]:px-4 group-[.ml-auto]:py-3",
        "group-[.items-start]:bg-muted/60 group-[.items-start]:rounded-2xl group-[.items-start]:px-4 group-[.items-start]:py-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

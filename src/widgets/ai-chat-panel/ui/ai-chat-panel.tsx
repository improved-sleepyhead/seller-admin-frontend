import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/shadcn"

import type { ReactNode } from "react"

interface AiChatPanelProps {
  children: ReactNode
}

export function AiChatPanel({ children }: AiChatPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AI чат</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

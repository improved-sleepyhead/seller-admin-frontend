import { useEffect, useState } from "react"

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/shared/ui/shadcn"

import type { ReactNode } from "react"

interface AiChatPanelProps {
  children: ReactNode
  disabled: boolean
}

const MOBILE_MEDIA_QUERY = "(max-width: 1023px)"

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.matchMedia(MOBILE_MEDIA_QUERY).matches
  })

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY)
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    setIsMobile(mediaQueryList.matches)
    mediaQueryList.addEventListener("change", handleMediaChange)

    return () => {
      mediaQueryList.removeEventListener("change", handleMediaChange)
    }
  }, [])

  return isMobile
}

export function AiChatPanel({ children, disabled }: AiChatPanelProps) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <>
        <Button
          className="w-full"
          disabled={disabled}
          type="button"
          variant="outline"
          onClick={() => {
            setIsMobileSheetOpen(true)
          }}
        >
          Открыть AI чат
        </Button>
        <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
          <SheetContent className="max-h-[90vh]" side="bottom">
            <SheetHeader>
              <SheetTitle>AI чат</SheetTitle>
              <SheetDescription>
                Диалог сохраняется локально для текущего объявления.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-4">{children}</div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-base">AI чат</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

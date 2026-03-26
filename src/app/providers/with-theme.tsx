import { ThemeProvider } from "@/shared/ui/theme"

import type { ReactNode } from "react"

export function WithTheme({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

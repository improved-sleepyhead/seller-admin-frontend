import { QueryClientProvider } from "@tanstack/react-query"

import { createQueryClient } from "@/app/config"

import type { ReactNode } from "react"

const queryClient = createQueryClient()

export function WithQueryClient({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

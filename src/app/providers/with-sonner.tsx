import { Toaster } from "@/shared/ui/shadcn"

import type { ReactNode } from "react"


export function WithSonner({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}

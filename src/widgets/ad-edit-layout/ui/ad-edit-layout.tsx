import { Card, CardContent, CardFooter, Skeleton } from "@/shared/ui/shadcn"

import type { ReactNode } from "react"

interface AdEditLayoutProps {
  aiArea: ReactNode
  footer: ReactNode
  formArea: ReactNode
}

export function AdEditLayout({ aiArea, footer, formArea }: AdEditLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div>{formArea}</div>
        <div>{aiArea}</div>
      </div>

      <Card>
        <CardFooter className="flex justify-end gap-2 pt-6">
          {footer}
        </CardFooter>
      </Card>
    </div>
  )
}

export function AdEditLayoutSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardFooter className="flex justify-end gap-2 pt-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
  )
}

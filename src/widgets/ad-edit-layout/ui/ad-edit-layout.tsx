import { Link } from "react-router-dom"

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton
} from "@/shared/ui/shadcn"

import type { ReactNode } from "react"

interface AdEditLayoutProps {
  aiArea: ReactNode
  footer: ReactNode
  formArea: ReactNode
}

export function AdEditLayout({ aiArea, footer, formArea }: AdEditLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          {formArea}
          <Card className="bg-card/95 sticky bottom-2 z-10 gap-0 py-0 backdrop-blur-sm">
            <CardFooter className="flex w-full justify-end gap-3 px-4 py-3 sm:px-5">
              {footer}
            </CardFooter>
          </Card>
        </div>
        <div>{aiArea}</div>
      </div>
    </div>
  )
}

export function AdEditLayoutSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardFooter className="flex w-full justify-end gap-3 px-4 py-3 sm:px-5">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-28" />
            </CardFooter>
          </Card>
        </div>

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
    </div>
  )
}

interface AdEditNotFoundStateProps {
  backHref: string
}

interface AdEditErrorStateProps {
  backHref: string
  message?: string
  onRetry: () => void
}

export function AdEditNotFoundState({ backHref }: AdEditNotFoundStateProps) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Объявление не найдено</CardTitle>
          <CardDescription>
            Проверьте корректность ссылки или вернитесь к списку объявлений.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link to={backHref}>Вернуться к списку</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function AdEditErrorState({
  backHref,
  message,
  onRetry
}: AdEditErrorStateProps) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Не удалось загрузить объявление</CardTitle>
          <CardDescription>
            {message ?? "Попробуйте повторить запрос ещё раз."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onRetry}>
            Повторить
          </Button>
          <Button asChild variant="ghost">
            <Link to={backHref}>К списку</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

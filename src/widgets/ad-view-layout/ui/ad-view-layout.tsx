import { AlertTriangle } from "lucide-react"
import { Link } from "react-router-dom"

import {
  AdDescription,
  AdImage,
  AdPrice,
  AdRevisionBadge,
  AdSpecsList,
  type AdDetailsVM
} from "@/entities/ad"
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton
} from "@/shared/ui/shadcn"

interface AdViewLayoutProps {
  ad: AdDetailsVM
  backHref: string
  editHref: string
}

interface AdViewErrorStateProps {
  backHref: string
  onRetry: () => void
  message?: string
}

interface AdViewNotFoundStateProps {
  backHref: string
}

function getMainImage(images: string[]): string | null {
  const image = images.find(value => value.trim().length > 0)
  return image ?? null
}

function MissingFieldsList({ missingFields }: { missingFields: string[] }) {
  if (missingFields.length === 0) {
    return (
      <p className="text-amber-900 dark:text-amber-100">
        Проверьте описание и характеристики объявления.
      </p>
    )
  }

  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900 dark:text-amber-100">
      {missingFields.map(field => (
        <li key={field}>{field}</li>
      ))}
    </ul>
  )
}

export function AdViewLayout({ ad, backHref, editHref }: AdViewLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild size="sm" variant="outline">
          <Link to={backHref}>К списку</Link>
        </Button>
        <Button asChild size="sm">
          <Link to={editHref}>Редактировать</Link>
        </Button>
      </div>

      {ad.needsRevision ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/30">
          <div className="mb-2 flex items-center gap-2 font-medium text-amber-900 dark:text-amber-100">
            <AlertTriangle className="size-4" aria-hidden />
            <span>Требуются доработки объявления</span>
          </div>
          <MissingFieldsList missingFields={ad.missingFields} />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden py-0">
          <CardContent className="p-0">
            <AdImage
              alt={ad.title}
              className="aspect-[4/3] w-full rounded-none"
              src={getMainImage(ad.images)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              {ad.needsRevision ? <AdRevisionBadge /> : null}
            </div>
            <CardTitle className="text-xl">{ad.title}</CardTitle>
            <AdPrice priceLabel={ad.priceLabel} />
            <CardDescription>
              Создано: {ad.createdAtLabel}
              <br />
              Обновлено: {ad.updatedAtLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdSpecsList specs={ad.filledSpecs} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Описание</CardTitle>
        </CardHeader>
        <CardContent>
          <AdDescription descriptionText={ad.descriptionText} />
        </CardContent>
      </Card>
    </div>
  )
}

export function AdViewLayoutSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-5xl space-y-6"
      aria-label="Загрузка объявления"
    >
      <div className="flex justify-between gap-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>

      <Skeleton className="h-16 w-full rounded-lg" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-9/12" />
        </CardContent>
      </Card>
    </div>
  )
}

export function AdViewNotFoundState({ backHref }: AdViewNotFoundStateProps) {
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

export function AdViewErrorState({
  backHref,
  message,
  onRetry
}: AdViewErrorStateProps) {
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

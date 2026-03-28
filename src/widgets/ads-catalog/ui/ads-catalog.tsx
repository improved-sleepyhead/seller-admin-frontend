import { useMemo } from "react"
import { Link } from "react-router-dom"

import {
  type AdsLayout,
  type AdsListItemVM,
  AdCard,
  AdCardListItem,
  createAdsListNavigationState,
  type AdsListNavigationState,
  useAdsListState
} from "@/entities/ad"
import { ResetFiltersButton } from "@/features/ads-filtering"
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton
} from "@/shared/ui/shadcn"

interface AdsCatalogProps {
  ads: AdsListItemVM[]
  layout: AdsLayout
}

interface AdsCatalogSkeletonProps {
  layout: AdsLayout
}

interface AdsErrorStateProps {
  onRetry: () => void
  message?: string
}

interface AdsListContentProps {
  ads: AdsListItemVM[]
  navigationState: AdsListNavigationState
}

function AdsGrid({ ads, navigationState }: AdsListContentProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {ads.map(ad => (
        <Link
          key={ad.id}
          to={`/ads/${ad.id}`}
          state={navigationState}
          className="focus-visible:ring-ring rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <AdCard
            ad={ad}
            className="h-full transition-transform hover:-translate-y-0.5"
          />
        </Link>
      ))}
    </div>
  )
}

function AdsList({ ads, navigationState }: AdsListContentProps) {
  return (
    <div className="space-y-4">
      {ads.map(ad => (
        <Link
          key={ad.id}
          to={`/ads/${ad.id}`}
          state={navigationState}
          className="focus-visible:ring-ring block rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <AdCardListItem
            ad={ad}
            className="transition-shadow hover:shadow-md"
          />
        </Link>
      ))}
    </div>
  )
}

export function AdsCatalog({ ads, layout }: AdsCatalogProps) {
  const q = useAdsListState(state => state.q)
  const categories = useAdsListState(state => state.categories)
  const needsRevision = useAdsListState(state => state.needsRevision)
  const sortColumn = useAdsListState(state => state.sortColumn)
  const sortDirection = useAdsListState(state => state.sortDirection)
  const page = useAdsListState(state => state.page)
  const currentLayout = useAdsListState(state => state.layout)

  const navigationState = useMemo(() => {
    return createAdsListNavigationState({
      categories,
      layout: currentLayout,
      needsRevision,
      page,
      q,
      sortColumn,
      sortDirection
    })
  }, [
    categories,
    currentLayout,
    needsRevision,
    page,
    q,
    sortColumn,
    sortDirection
  ])

  return layout === "list" ? (
    <AdsList ads={ads} navigationState={navigationState} />
  ) : (
    <AdsGrid ads={ads} navigationState={navigationState} />
  )
}

export function AdsCatalogSkeleton({ layout }: AdsCatalogSkeletonProps) {
  if (layout === "list") {
    return (
      <div className="space-y-4" aria-label="Загрузка списка объявлений">
        {Array.from({ length: 4 }, (_, index) => (
          <Card
            key={`ads-list-skeleton-${index}`}
            className="overflow-hidden py-0"
          >
            <div className="flex flex-col sm:flex-row">
              <Skeleton className="h-48 w-full shrink-0 sm:h-auto sm:w-56" />
              <CardContent className="flex-1 space-y-3 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-1/2" />
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-label="Загрузка списка объявлений"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <Card
          key={`ads-grid-skeleton-${index}`}
          className="overflow-hidden py-0"
        >
          <Skeleton className="aspect-[4/3] w-full" />
          <CardContent className="space-y-3 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function AdsEmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Объявления не найдены</CardTitle>
        <CardDescription>
          Измените параметры поиска или сбросьте фильтры.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetFiltersButton />
      </CardContent>
    </Card>
  )
}

export function AdsErrorState({ onRetry, message }: AdsErrorStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Не удалось загрузить список</CardTitle>
        <CardDescription>
          {message ?? "Попробуйте повторить запрос ещё раз."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" variant="outline" onClick={onRetry}>
          Повторить
        </Button>
      </CardContent>
    </Card>
  )
}

import { AdsPagination } from "@/features/ads-pagination"
import {
  AdsCatalog,
  AdsCatalogSkeleton,
  AdsEmptyState,
  AdsErrorState
} from "@/widgets/ads-catalog"
import { AdsFiltersPanel } from "@/widgets/ads-filters-panel"
import { AdsToolbar } from "@/widgets/ads-toolbar"

import type { AdsListPageModel } from "../model"

interface AdsListPageScreenProps {
  model: AdsListPageModel
}

function getCatalogContent(model: AdsListPageModel) {
  switch (model.catalog.state) {
    case "loading":
      return <AdsCatalogSkeleton layout={model.layout} />
    case "error":
      return (
        <AdsErrorState
          message={model.catalog.message}
          onRetry={model.catalog.onRetry}
        />
      )
    case "empty":
      return <AdsEmptyState />
    case "ready":
      return (
        <AdsCatalog
          ads={model.catalog.ads}
          layout={model.layout}
          navigationState={model.navigationState}
        />
      )
  }
}

export function AdsListPageScreen({ model }: AdsListPageScreenProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <AdsToolbar isRefreshing={model.isRefreshing} />

      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AdsFiltersPanel />

        <section className="space-y-6">
          {getCatalogContent(model)}
          <div className="flex justify-center">
            <AdsPagination total={model.total} />
          </div>
        </section>
      </div>
    </div>
  )
}

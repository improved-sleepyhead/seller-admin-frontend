import {
  AdViewErrorState,
  AdViewLayout,
  AdViewLayoutSkeleton,
  AdViewNotFoundState
} from "@/widgets/ad-view-layout"

import type { AdViewPageModel } from "../model"

interface AdViewPageScreenProps {
  model: AdViewPageModel
}

export function AdViewPageScreen({ model }: AdViewPageScreenProps) {
  switch (model.state) {
    case "not-found":
      return <AdViewNotFoundState backHref={model.backHref} />
    case "loading":
      return <AdViewLayoutSkeleton />
    case "error":
      return (
        <AdViewErrorState
          backHref={model.backHref}
          message={model.message}
          onRetry={model.onRetry}
        />
      )
    case "ready":
      return (
        <AdViewLayout
          ad={model.ad}
          backHref={model.backHref}
          editHref={model.editHref}
          editState={model.editState}
        />
      )
  }
}

import {
  AdEditErrorState,
  AdEditLayoutSkeleton,
  AdEditNotFoundState
} from "@/widgets/ad-edit-layout"

import { AdEditPageReadyScreen } from "./ad-edit-page-ready-screen"

import type { AdEditPageModel } from "../model"

interface AdEditPageScreenProps {
  model: AdEditPageModel
}

export function AdEditPageScreen({ model }: AdEditPageScreenProps) {
  switch (model.state) {
    case "not-found":
      return <AdEditNotFoundState backHref={model.backHref} />
    case "loading":
      return <AdEditLayoutSkeleton />
    case "error":
      return (
        <AdEditErrorState
          backHref={model.backHref}
          message={model.message}
          onRetry={model.onRetry}
        />
      )
    case "ready":
      return <AdEditPageReadyScreen model={model} />
  }
}

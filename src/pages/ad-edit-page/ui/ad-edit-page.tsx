import { CategoryChangeConfirmDialog } from "@/features/ad-category-change"
import { DraftRestoreDialog } from "@/features/ad-draft"
import {
  AdEditErrorState,
  AdEditLayoutSkeleton,
  AdEditNotFoundState
} from "@/widgets/ad-edit-layout"

import { useAdEditPageModel } from "../model"
import { AdEditPageReadyContent } from "./ad-edit-page-ready-content"

export function AdEditPage() {
  const model = useAdEditPageModel()

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
      return (
        <div>
          <AdEditPageReadyContent
            aiSection={model.aiSection}
            footerSection={model.footerSection}
            formSection={model.formSection}
          />

          <CategoryChangeConfirmDialog {...model.dialogs.categoryChange} />

          <DraftRestoreDialog {...model.dialogs.draftRestore} />
        </div>
      )
  }
}

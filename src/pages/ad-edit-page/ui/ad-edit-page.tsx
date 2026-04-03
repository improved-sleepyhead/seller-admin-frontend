import { CategoryChangeConfirmDialog } from "@/features/ad-category-change"
import { DraftRestoreDialog } from "@/features/ad-draft"
import {
  AdEditErrorState,
  AdEditLayout,
  AdEditLayoutSkeleton,
  AdEditNotFoundState
} from "@/widgets/ad-edit-layout"

import { useAdEditPageModel } from "../model"
import { AdEditAiToolsSection } from "./ad-edit-ai-tools-section"
import { AdEditFooterActions } from "./ad-edit-footer-actions"
import { AdEditFormSection } from "./ad-edit-form-section"

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
          <AdEditLayout
            aiArea={<AdEditAiToolsSection {...model.aiSection} />}
            footer={<AdEditFooterActions {...model.footerSection} />}
            formArea={<AdEditFormSection {...model.formSection} />}
          />

          <CategoryChangeConfirmDialog {...model.dialogs.categoryChange} />

          <DraftRestoreDialog {...model.dialogs.draftRestore} />
        </div>
      )
  }
}

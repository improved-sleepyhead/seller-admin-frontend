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
            aiArea={
              <AdEditAiToolsSection
                adId={model.adId}
                ai={model.ai}
                editForm={model.editForm}
              />
            }
            footer={
              <AdEditFooterActions
                adId={model.adId}
                navigationState={model.navigationState}
                savePending={model.savePending}
              />
            }
            formArea={
              <AdEditFormSection
                ad={model.ad}
                draftSavedAt={model.draft.draftSavedAt}
                onCategoryChangeRequest={
                  model.categoryChange.requestCategoryChange
                }
                onFormReady={model.onFormReady}
                onSubmit={model.onSubmit}
                savePending={model.savePending}
              />
            }
          />

          <CategoryChangeConfirmDialog
            nextCategory={model.categoryChange.requestedCategory}
            onCancel={model.categoryChange.cancelCategoryChange}
            onConfirm={model.categoryChange.confirmCategoryChange}
            open={model.categoryChange.isCategoryChangeDialogOpen}
          />

          <DraftRestoreDialog
            onRestoreDraft={model.draft.restoreDraft}
            onUseServerVersion={model.draft.useServerVersion}
            open={model.draft.isRestoreDialogOpen}
          />
        </div>
      )
  }
}

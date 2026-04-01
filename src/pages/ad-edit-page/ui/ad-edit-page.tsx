import { AdAiChat } from "@/features/ad-ai-chat"
import { AiDescriptionAction } from "@/features/ad-ai-description"
import { AiPriceAction } from "@/features/ad-ai-price"
import { CancelEditButton } from "@/features/ad-cancel-edit"
import { CategoryChangeConfirmDialog } from "@/features/ad-category-change"
import { DraftRestoreDialog, DraftSavedHint } from "@/features/ad-draft"
import { AdEditForm } from "@/features/ad-edit-form"
import { SaveAdButton } from "@/features/ad-save"
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/shared/ui/shadcn"
import {
  AdEditErrorState,
  AdEditLayout,
  AdEditLayoutSkeleton,
  AdEditNotFoundState
} from "@/widgets/ad-edit-layout"
import { AiChatPanel } from "@/widgets/ai-chat-panel"

import { useAdEditPageModel } from "../model"

const EDIT_FORM_ID = "ad-edit-form"

export function AdEditPage() {
  const model = useAdEditPageModel()

  if (model.state === "not-found") {
    return <AdEditNotFoundState backHref={model.backHref} />
  }

  if (model.state === "loading") {
    return <AdEditLayoutSkeleton />
  }

  if (model.state === "error") {
    return (
      <AdEditErrorState
        backHref={model.backHref}
        message={model.message}
        onRetry={model.onRetry}
      />
    )
  }

  const aiArea = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI инструменты</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AiDescriptionAction
            disabled={!model.ai.descriptionEnabled}
            form={model.editForm}
          />
          <AiPriceAction
            disabled={!model.ai.priceEnabled}
            form={model.editForm}
          />
          <div className="space-y-2">
            <Badge variant={model.ai.badgeVariant}>{model.ai.label}</Badge>
            <p className="text-muted-foreground text-sm">{model.ai.message}</p>
            <p className="text-muted-foreground text-sm">
              Модель: {model.ai.model}
            </p>
          </div>
        </CardContent>
      </Card>

      <AiChatPanel disabled={!model.ai.chatEnabled}>
        <AdAiChat
          disabled={!model.ai.chatEnabled}
          form={model.editForm}
          itemId={model.adId}
        />
      </AiChatPanel>
    </div>
  )

  const formArea = (
    <Card>
      <CardHeader>
        <CardTitle>Редактирование объявления</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <DraftSavedHint savedAt={model.draft.draftSavedAt} />
        <AdEditForm
          ad={model.ad}
          formId={EDIT_FORM_ID}
          hideActions
          isSavePending={model.savePending}
          onCategoryChangeRequest={({ applyCategoryChange, nextCategory }) => {
            model.categoryChange.requestCategoryChange({
              nextCategory,
              onConfirm: applyCategoryChange
            })
          }}
          onFormReady={model.onFormReady}
          onSubmit={model.onSubmit}
        />
      </CardContent>
    </Card>
  )

  return (
    <div>
      <AdEditLayout
        aiArea={aiArea}
        footer={
          <>
            <CancelEditButton
              disabled={model.savePending}
              itemId={model.adId}
              navigationState={model.navigationState}
            />
            <SaveAdButton
              disabled={model.savePending}
              form={EDIT_FORM_ID}
              isPending={model.savePending}
            />
          </>
        }
        formArea={formArea}
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

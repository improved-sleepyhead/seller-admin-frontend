import { memo } from "react"

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
import { AdEditLayout } from "@/widgets/ad-edit-layout"
import { AiChatPanel } from "@/widgets/ai-chat-panel"

import type { AdEditPageReadyState } from "../model"

const EDIT_FORM_ID = "ad-edit-form"

interface AdEditAiToolsSectionProps {
  adId: number
  ai: AdEditPageReadyState["ai"]
  editForm: AdEditPageReadyState["editForm"]
}

const AdEditAiToolsSection = memo(function AdEditAiToolsSection({
  adId,
  ai,
  editForm
}: AdEditAiToolsSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI инструменты</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AiDescriptionAction
            disabled={!ai.descriptionEnabled}
            form={editForm}
          />
          <AiPriceAction disabled={!ai.priceEnabled} form={editForm} />
          <div className="space-y-2">
            <Badge variant={ai.badgeVariant}>{ai.label}</Badge>
            <p className="text-muted-foreground text-sm">{ai.message}</p>
            <p className="text-muted-foreground text-sm">Модель: {ai.model}</p>
          </div>
        </CardContent>
      </Card>

      <AiChatPanel disabled={!ai.chatEnabled}>
        <AdAiChat disabled={!ai.chatEnabled} form={editForm} itemId={adId} />
      </AiChatPanel>
    </div>
  )
})

interface AdEditFooterActionsProps {
  adId: number
  navigationState: AdEditPageReadyState["navigationState"]
  savePending: boolean
}

const AdEditFooterActions = memo(function AdEditFooterActions({
  adId,
  navigationState,
  savePending
}: AdEditFooterActionsProps) {
  return (
    <>
      <CancelEditButton
        disabled={savePending}
        itemId={adId}
        navigationState={navigationState}
      />
      <SaveAdButton
        disabled={savePending}
        form={EDIT_FORM_ID}
        isPending={savePending}
      />
    </>
  )
})

interface AdEditFormSectionProps {
  ad: AdEditPageReadyState["ad"]
  draftSavedAt: AdEditPageReadyState["draft"]["draftSavedAt"]
  onCategoryChangeRequest: AdEditPageReadyState["categoryChange"]["requestCategoryChange"]
  onFormReady: AdEditPageReadyState["onFormReady"]
  onSubmit: AdEditPageReadyState["onSubmit"]
  savePending: boolean
}

const AdEditFormSection = memo(function AdEditFormSection({
  ad,
  draftSavedAt,
  onCategoryChangeRequest,
  onFormReady,
  onSubmit,
  savePending
}: AdEditFormSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Редактирование объявления</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <DraftSavedHint savedAt={draftSavedAt} />
        <AdEditForm
          ad={ad}
          formId={EDIT_FORM_ID}
          hideActions
          isSavePending={savePending}
          onCategoryChangeRequest={({ applyCategoryChange, nextCategory }) => {
            onCategoryChangeRequest({
              nextCategory,
              onConfirm: applyCategoryChange
            })
          }}
          onFormReady={onFormReady}
          onSubmit={onSubmit}
        />
      </CardContent>
    </Card>
  )
})

interface AdEditPageReadyScreenProps {
  model: AdEditPageReadyState
}

export function AdEditPageReadyScreen({ model }: AdEditPageReadyScreenProps) {
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
            onCategoryChangeRequest={model.categoryChange.requestCategoryChange}
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

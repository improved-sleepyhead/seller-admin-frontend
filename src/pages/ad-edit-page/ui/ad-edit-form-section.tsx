import { memo } from "react"

import { AiDescriptionAction } from "@/features/ad-ai-description"
import { AiPriceAction } from "@/features/ad-ai-price"
import { DraftSavedHint } from "@/features/ad-draft"
import { AdEditForm } from "@/features/ad-edit-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/shadcn"

import type { FormSectionProps } from "../model"

const EDIT_FORM_ID = "ad-edit-form"

export const AdEditFormSection = memo(function AdEditFormSection({
  ad,
  ai,
  draftSavedAt,
  form,
  onCategoryChangeRequest,
  onFormReady,
  onSubmit,
  savePending
}: FormSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Редактирование объявления</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <DraftSavedHint savedAt={draftSavedAt} />
        <AdEditForm
          ad={ad}
          descriptionAction={
            <AiDescriptionAction
              disabled={!ai.descriptionEnabled}
              form={form}
            />
          }
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
          priceAction={
            <AiPriceAction disabled={!ai.priceEnabled} form={form} />
          }
        />
      </CardContent>
    </Card>
  )
})

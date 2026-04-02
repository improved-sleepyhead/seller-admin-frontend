import { memo } from "react"

import { DraftSavedHint } from "@/features/ad-draft"
import { AdEditForm } from "@/features/ad-edit-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/shadcn"

import type { AdEditPageReadyState } from "../model"

const EDIT_FORM_ID = "ad-edit-form"

interface AdEditFormSectionProps {
  ad: AdEditPageReadyState["ad"]
  draftSavedAt: AdEditPageReadyState["draft"]["draftSavedAt"]
  onCategoryChangeRequest: AdEditPageReadyState["categoryChange"]["requestCategoryChange"]
  onFormReady: AdEditPageReadyState["onFormReady"]
  onSubmit: AdEditPageReadyState["onSubmit"]
  savePending: boolean
}

export const AdEditFormSection = memo(function AdEditFormSection({
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

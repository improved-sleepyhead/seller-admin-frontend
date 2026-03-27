import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"

import { adEditDetailQuery } from "@/entities/ad"
import { CancelEditButton } from "@/features/ad-cancel-edit"
import {
  CategoryChangeConfirmDialog,
  useCategoryChangeConfirm
} from "@/features/ad-category-change"
import { AdEditForm } from "@/features/ad-edit-form"
import { SaveAdButton, useSaveAd } from "@/features/ad-save"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/shadcn"

function parseAdId(rawId: string | undefined): number | null {
  if (!rawId) {
    return null
  }

  const parsedId = Number(rawId)

  if (!Number.isInteger(parsedId) || parsedId < 1) {
    return null
  }

  return parsedId
}

export function AdEditPage() {
  const { id } = useParams<{ id: string }>()
  const adId = parseAdId(id)
  const { isSavePending, saveAd } = useSaveAd({ itemId: adId ?? 0 })
  const {
    cancelCategoryChange,
    confirmCategoryChange,
    isCategoryChangeDialogOpen,
    requestCategoryChange,
    requestedCategory
  } = useCategoryChangeConfirm()
  const detailQuery = useQuery({
    ...adEditDetailQuery(adId ?? 0),
    enabled: adId !== null
  })

  if (adId === null) {
    return <div>Некорректный идентификатор объявления.</div>
  }

  if (detailQuery.isPending) {
    return <div>Загрузка объявления...</div>
  }

  if (detailQuery.isError) {
    return <div>Не удалось загрузить объявление.</div>
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Редактирование объявления</CardTitle>
        </CardHeader>
        <CardContent>
          <AdEditForm
            CancelButton={({ disabled }) => (
              <CancelEditButton disabled={disabled} itemId={adId} />
            )}
            SubmitButton={SaveAdButton}
            ad={detailQuery.data}
            isSavePending={isSavePending}
            onCategoryChangeRequest={({
              applyCategoryChange,
              nextCategory
            }) => {
              requestCategoryChange({
                nextCategory,
                onConfirm: applyCategoryChange
              })
            }}
            onSubmit={saveAd}
          />
        </CardContent>
      </Card>

      <CategoryChangeConfirmDialog
        nextCategory={requestedCategory}
        onCancel={cancelCategoryChange}
        onConfirm={confirmCategoryChange}
        open={isCategoryChangeDialogOpen}
      />
    </div>
  )
}

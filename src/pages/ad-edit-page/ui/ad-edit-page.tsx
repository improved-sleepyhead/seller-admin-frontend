import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"

import { adEditDetailQuery, aiStatusQuery } from "@/entities/ad"
import { AiChatPlaceholder } from "@/features/ad-ai-chat"
import { AiDescriptionAction } from "@/features/ad-ai-description"
import { AiPriceAction } from "@/features/ad-ai-price"
import { CancelEditButton } from "@/features/ad-cancel-edit"
import {
  CategoryChangeConfirmDialog,
  useCategoryChangeConfirm
} from "@/features/ad-category-change"
import { AdEditForm } from "@/features/ad-edit-form"
import { SaveAdButton, useSaveAd } from "@/features/ad-save"
import { isAppApiError } from "@/shared/api/error"
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/shared/ui/shadcn"
import { AdEditLayout, AdEditLayoutSkeleton } from "@/widgets/ad-edit-layout"
import { AiChatPanel } from "@/widgets/ai-chat-panel"

const EDIT_FORM_ID = "ad-edit-form"

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
  const aiStatusResult = useQuery({
    ...aiStatusQuery(),
    enabled: adId !== null
  })

  if (adId === null) {
    return <div>Некорректный идентификатор объявления.</div>
  }

  if (detailQuery.isPending || aiStatusResult.isPending) {
    return <AdEditLayoutSkeleton />
  }

  if (detailQuery.isError) {
    if (
      isAppApiError(detailQuery.error) &&
      detailQuery.error.code === "NOT_FOUND"
    ) {
      return (
        <div className="mx-auto w-full max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Объявление не найдено.</CardTitle>
            </CardHeader>
            <CardContent>Проверьте корректность идентификатора.</CardContent>
          </Card>
        </div>
      )
    }

    return <div>Не удалось загрузить объявление.</div>
  }

  const aiStatus = aiStatusResult.data
  const aiEnabled = aiStatus?.enabled === true && !aiStatusResult.isError
  const isDescriptionEnabled = aiEnabled && aiStatus.features.description
  const isPriceEnabled = aiEnabled && aiStatus.features.price
  const isChatEnabled = aiEnabled && aiStatus.features.chat

  const aiArea = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI инструменты</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AiDescriptionAction disabled={!isDescriptionEnabled} />
          <AiPriceAction disabled={!isPriceEnabled} />

          {aiStatusResult.isError ? (
            <p className="text-muted-foreground text-sm">
              Не удалось загрузить AI-статус. AI-контролы временно отключены.
            </p>
          ) : (
            <div className="space-y-2">
              <Badge variant={aiEnabled ? "default" : "secondary"}>
                {aiEnabled ? "AI доступен" : "AI недоступен"}
              </Badge>
              <p className="text-muted-foreground text-sm">
                Модель: {aiStatus?.model ?? "не указана"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AiChatPanel>
        <AiChatPlaceholder enabled={isChatEnabled} />
      </AiChatPanel>
    </div>
  )

  const formArea = (
    <Card>
      <CardHeader>
        <CardTitle>Редактирование объявления</CardTitle>
      </CardHeader>
      <CardContent>
        <AdEditForm
          ad={detailQuery.data}
          formId={EDIT_FORM_ID}
          hideActions
          isSavePending={isSavePending}
          onCategoryChangeRequest={({ applyCategoryChange, nextCategory }) => {
            requestCategoryChange({
              nextCategory,
              onConfirm: applyCategoryChange
            })
          }}
          onSubmit={saveAd}
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
            <CancelEditButton disabled={isSavePending} itemId={adId} />
            <SaveAdButton
              disabled={isSavePending}
              form={EDIT_FORM_ID}
              isPending={isSavePending}
            />
          </>
        }
        formArea={formArea}
      />

      <CategoryChangeConfirmDialog
        nextCategory={requestedCategory}
        onCancel={cancelCategoryChange}
        onConfirm={confirmCategoryChange}
        open={isCategoryChangeDialogOpen}
      />
    </div>
  )
}

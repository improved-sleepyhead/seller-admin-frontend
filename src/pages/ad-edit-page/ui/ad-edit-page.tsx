import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import {
  adEditDetailQuery,
  aiStatusQuery,
  type AdEditFormValues
} from "@/entities/ad"
import { AiChatPlaceholder } from "@/features/ad-ai-chat"
import { AiDescriptionAction } from "@/features/ad-ai-description"
import { AiPriceAction } from "@/features/ad-ai-price"
import { CancelEditButton } from "@/features/ad-cancel-edit"
import {
  CategoryChangeConfirmDialog,
  useCategoryChangeConfirm
} from "@/features/ad-category-change"
import {
  DraftRestoreDialog,
  DraftSavedHint,
  useAdDraft
} from "@/features/ad-draft"
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

import type { UseFormReturn } from "react-hook-form"

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
  const [editForm, setEditForm] = useState<UseFormReturn<
    AdEditFormValues,
    unknown,
    AdEditFormValues
  > | null>(null)
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
  const { draftSavedAt, isRestoreDialogOpen, restoreDraft, useServerVersion } =
    useAdDraft({
      ad: detailQuery.data ?? null,
      form: editForm,
      itemId: adId ?? 0
    })

  useEffect(() => {
    setEditForm(null)
  }, [adId])

  if (adId === null) {
    return <div>Некорректный идентификатор объявления.</div>
  }

  if (detailQuery.isPending) {
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

  const aiStatus = aiStatusResult.data ?? null
  const aiFeatures = aiStatus?.features ?? {
    chat: false,
    description: false,
    price: false
  }
  const aiEnabled =
    aiStatusResult.isSuccess && aiStatus?.enabled === true && !aiStatusResult.isError
  const isDescriptionEnabled = aiEnabled && aiFeatures.description
  const isPriceEnabled = aiEnabled && aiFeatures.price
  const isChatEnabled = aiEnabled && aiFeatures.chat

  const partiallyDisabledFeatures =
    aiEnabled
      ? [
          !aiFeatures.description ? "описание" : null,
          !aiFeatures.price ? "цена" : null,
          !aiFeatures.chat ? "чат" : null
        ].filter((value): value is string => value !== null)
      : []

  const aiStatusBadgeVariant = (() => {
    if (aiStatusResult.isError) {
      return "destructive" as const
    }

    if (aiEnabled) {
      return "default" as const
    }

    return "secondary" as const
  })()

  const aiStatusLabel = (() => {
    if (aiStatusResult.isPending) {
      return "Проверка AI..."
    }

    if (aiStatusResult.isError) {
      return "AI недоступен"
    }

    return aiEnabled ? "AI доступен" : "AI недоступен"
  })()

  const aiStatusMessage = (() => {
    if (aiStatusResult.isPending) {
      return "Проверяем доступность AI. До завершения проверки AI-контролы отключены."
    }

    if (aiStatusResult.isError) {
      return "Не удалось загрузить AI-статус. AI-контролы временно отключены."
    }

    if (!aiEnabled) {
      return "AI отключен в текущем окружении. Основное редактирование доступно без ограничений."
    }

    if (partiallyDisabledFeatures.length > 0) {
      return `Частично недоступно: ${partiallyDisabledFeatures.join(", ")}.`
    }

    return "Все AI-инструменты доступны."
  })()

  const aiArea = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI инструменты</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AiDescriptionAction disabled={!isDescriptionEnabled} />
          <AiPriceAction disabled={!isPriceEnabled} />
          <div className="space-y-2">
            <Badge variant={aiStatusBadgeVariant}>{aiStatusLabel}</Badge>
            <p className="text-muted-foreground text-sm">{aiStatusMessage}</p>
            <p className="text-muted-foreground text-sm">
              Модель: {aiStatus?.model ?? "не указана"}
            </p>
          </div>
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
      <CardContent className="space-y-3">
        <DraftSavedHint savedAt={draftSavedAt} />
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
          onFormReady={setEditForm}
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

      <DraftRestoreDialog
        onRestoreDraft={restoreDraft}
        onUseServerVersion={useServerVersion}
        open={isRestoreDialogOpen}
      />
    </div>
  )
}

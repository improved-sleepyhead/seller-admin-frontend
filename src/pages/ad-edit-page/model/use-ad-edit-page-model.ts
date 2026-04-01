import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useLocation, useParams } from "react-router-dom"

import type { AdDetailsDto, AiStatusDto } from "@/entities/ad/api"
import { adEditDetailQuery, adsKeys, aiStatusQuery } from "@/entities/ad/api"
import {
  buildAdsListHrefFromNavigationState,
  resolveAdsSearchFromNavigationState,
  type AdEditFormValues,
  type AdsListNavigationState
} from "@/entities/ad/model"
import { useCategoryChangeConfirm } from "@/features/ad-category-change"
import { useAdDraft } from "@/features/ad-draft"
import { useSaveAd } from "@/features/ad-save"
import { isAppApiError } from "@/shared/api/error"

import type { UseFormReturn } from "react-hook-form"

type AdEditPageFormApi = UseFormReturn<
  AdEditFormValues,
  unknown,
  AdEditFormValues
>
type AdEditAiBadgeVariant = "default" | "destructive" | "secondary"

interface AdEditPageAiState {
  badgeVariant: AdEditAiBadgeVariant
  chatEnabled: boolean
  descriptionEnabled: boolean
  label: string
  message: string
  model: string
  priceEnabled: boolean
}

interface AdEditPageLoadingState {
  backHref: string
  state: "loading"
}

interface AdEditPageNotFoundState {
  backHref: string
  state: "not-found"
}

interface AdEditPageErrorState {
  backHref: string
  message?: string
  onRetry: () => void
  state: "error"
}

interface AdEditPageReadyState {
  ad: AdDetailsDto
  adId: number
  ai: AdEditPageAiState
  backHref: string
  categoryChange: ReturnType<typeof useCategoryChangeConfirm>
  draft: ReturnType<typeof useAdDraft>
  editForm: AdEditPageFormApi | null
  navigationState?: AdsListNavigationState
  onFormReady: (form: AdEditPageFormApi | null) => void
  onSubmit: (values: AdEditFormValues) => Promise<void>
  savePending: boolean
  state: "ready"
}

export type AdEditPageModel =
  | AdEditPageLoadingState
  | AdEditPageNotFoundState
  | AdEditPageErrorState
  | AdEditPageReadyState

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

function resolveNavigationState(
  state: unknown
): AdsListNavigationState | undefined {
  const adsSearch = resolveAdsSearchFromNavigationState(state)

  if (adsSearch === null) {
    return undefined
  }

  return { adsSearch }
}

function getPartiallyDisabledFeatures(aiStatus: AiStatusDto | null): string[] {
  if (aiStatus?.enabled !== true) {
    return []
  }

  return [
    !aiStatus.features.description ? "описание" : null,
    !aiStatus.features.price ? "цена" : null,
    !aiStatus.features.chat ? "чат" : null
  ].filter((value): value is string => value !== null)
}

function getAiState(
  aiStatus: AiStatusDto | null,
  isError: boolean,
  isPending: boolean
): AdEditPageAiState {
  const aiEnabled = !isError && aiStatus?.enabled === true
  const partiallyDisabledFeatures = getPartiallyDisabledFeatures(aiStatus)

  let badgeVariant: AdEditAiBadgeVariant = "secondary"
  let label = "AI недоступен"
  let message =
    "AI отключен в текущем окружении. Основное редактирование доступно без ограничений."

  if (isPending) {
    label = "Проверка AI..."
    message =
      "Проверяем доступность AI. До завершения проверки AI-контролы отключены."
  } else if (isError) {
    badgeVariant = "destructive"
    message = "Не удалось загрузить AI-статус. AI-контролы временно отключены."
  } else if (aiEnabled) {
    badgeVariant = "default"
    label = "AI доступен"
    message =
      partiallyDisabledFeatures.length > 0
        ? `Частично недоступно: ${partiallyDisabledFeatures.join(", ")}.`
        : "Все AI-инструменты доступны."
  }

  return {
    badgeVariant,
    chatEnabled: aiEnabled && aiStatus.features.chat,
    descriptionEnabled: aiEnabled && aiStatus.features.description,
    label,
    message,
    model: aiStatus?.model ?? "не указана",
    priceEnabled: aiEnabled && aiStatus.features.price
  }
}

export function useAdEditPageModel(): AdEditPageModel {
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const adId = parseAdId(id)
  const backHref = buildAdsListHrefFromNavigationState(location.state)
  const navigationState = resolveNavigationState(location.state)
  const [editEntryRevision, setEditEntryRevision] = useState(0)
  const [editForm, setEditForm] = useState<AdEditPageFormApi | null>(null)
  const saveState = useSaveAd({
    itemId: adId ?? 0,
    navigationState
  })
  const categoryChange = useCategoryChangeConfirm()
  const detailQuery = useQuery({
    ...adEditDetailQuery(adId ?? 0),
    enabled: adId !== null
  })
  const aiStatusQueryResult = useQuery({
    ...aiStatusQuery(),
    enabled: adId !== null
  })
  const draft = useAdDraft({
    ad: detailQuery.data ?? null,
    entryRevision: editEntryRevision,
    form: editForm,
    itemId: adId ?? 0
  })

  useEffect(() => {
    if (!location.pathname.endsWith("/edit")) {
      return
    }

    setEditEntryRevision(previousRevision => previousRevision + 1)
  }, [location.pathname])

  useEffect(() => {
    if (adId === null) {
      return
    }

    const detailQueryKey = adsKeys.editDetail(adId)
    const aiStatusQueryKey = adsKeys.aiStatus()

    return () => {
      void queryClient.cancelQueries({
        exact: true,
        queryKey: detailQueryKey
      })
      void queryClient.cancelQueries({
        exact: true,
        queryKey: aiStatusQueryKey
      })
    }
  }, [adId, queryClient])

  if (adId === null) {
    return {
      backHref,
      state: "not-found"
    }
  }

  if (detailQuery.isPending) {
    return {
      backHref,
      state: "loading"
    }
  }

  if (detailQuery.isError) {
    if (
      isAppApiError(detailQuery.error) &&
      detailQuery.error.code === "NOT_FOUND"
    ) {
      return {
        backHref,
        state: "not-found"
      }
    }

    return {
      backHref,
      message: isAppApiError(detailQuery.error)
        ? detailQuery.error.message
        : undefined,
      onRetry: () => {
        void detailQuery.refetch()
      },
      state: "error"
    }
  }

  return {
    ad: detailQuery.data,
    adId,
    ai: getAiState(
      aiStatusQueryResult.data ?? null,
      aiStatusQueryResult.isError,
      aiStatusQueryResult.isPending
    ),
    backHref,
    categoryChange,
    draft,
    editForm,
    navigationState,
    onFormReady: setEditForm,
    onSubmit: saveState.saveAd,
    savePending: saveState.isSavePending,
    state: "ready"
  }
}

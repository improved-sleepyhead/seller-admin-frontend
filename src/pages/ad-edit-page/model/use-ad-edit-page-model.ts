import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useLocation, useParams } from "react-router-dom"

import { adEditDetailQuery, aiStatusQuery } from "@/entities/ad/api"
import { getAdsListHref } from "@/entities/ad/model"
import { useCategoryChangeConfirm } from "@/features/ad-category-change"
import { useAdDraft } from "@/features/ad-draft"
import { useSaveAd } from "@/features/ad-save"

import { getAdEditPageAiState } from "./ad-edit-page.ai-state"
import {
  useAdEditEntryRevision,
  useCancelAdEditPageQueries
} from "./ad-edit-page.effects"
import {
  parseAdEditPageId,
  resolveAdEditNavigationState
} from "./ad-edit-page.navigation"
import { getScreenState } from "./ad-edit-page.screen-state"

import type {
  AdEditPageFormApi,
  AdEditPageModel
} from "./ad-edit-page.contract"

export function useAdEditPageModel(): AdEditPageModel {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const adId = parseAdEditPageId(id)
  const backHref = getAdsListHref(location.state)
  const navigationState = resolveAdEditNavigationState(location.state)
  const editEntryRevision = useAdEditEntryRevision(location.pathname)
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
  useCancelAdEditPageQueries(adId)

  const screenState = getScreenState(adId, backHref, detailQuery)

  if (screenState !== null) {
    return screenState
  }

  const ad = detailQuery.data

  if (adId === null || ad === undefined) {
    return {
      backHref,
      state: "loading"
    }
  }

  return {
    ad,
    adId,
    ai: getAdEditPageAiState(
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

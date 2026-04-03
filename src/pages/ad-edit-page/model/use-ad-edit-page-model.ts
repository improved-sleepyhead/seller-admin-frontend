import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useLocation, useParams } from "react-router-dom"

import { adEditDetailQuery, aiStatusQuery } from "@/entities/ad/api"
import { getAdsListHref } from "@/entities/ad/model"
import { useCategoryChangeConfirm } from "@/features/ad-category-change"
import { useAdDraft } from "@/features/ad-draft"
import { useSaveAd } from "@/features/ad-save"

import { getAiState } from "./ad-edit-page.ai-state"
import { useCancelPageQueries, useEntryRevision } from "./ad-edit-page.effects"
import { parseAdId, resolveNavigationState } from "./ad-edit-page.navigation"
import { getScreenState } from "./ad-edit-page.screen-state"

import type { AdEditPageModel, FormApi } from "./ad-edit-page.contract"

export function useAdEditPageModel(): AdEditPageModel {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const adId = parseAdId(id)
  const backHref = useMemo(
    () => getAdsListHref(location.state),
    [location.state]
  )
  const navigationState = useMemo(
    () => resolveNavigationState(location.state),
    [location.state]
  )
  const entryRevision = useEntryRevision(location.pathname)
  const [editForm, setEditForm] = useState<FormApi | null>(null)
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
    entryRevision,
    form: editForm,
    itemId: adId ?? 0
  })
  useCancelPageQueries(adId)

  const ad = detailQuery.data
  const aiState = useMemo(
    () =>
      getAiState(
        aiStatusQueryResult.data ?? null,
        aiStatusQueryResult.isError,
        aiStatusQueryResult.isPending
      ),
    [
      aiStatusQueryResult.data,
      aiStatusQueryResult.isError,
      aiStatusQueryResult.isPending
    ]
  )
  const aiSection = useMemo(() => {
    if (adId === null) {
      return null
    }

    return {
      adId,
      ai: aiState,
      form: editForm
    }
  }, [adId, aiState, editForm])
  const footerSection = useMemo(() => {
    if (adId === null) {
      return null
    }

    return {
      adId,
      navigationState,
      savePending: saveState.isSavePending
    }
  }, [adId, navigationState, saveState.isSavePending])
  const formSection = useMemo(() => {
    if (ad === undefined) {
      return null
    }

    return {
      ad,
      draftSavedAt: draft.draftSavedAt,
      onCategoryChangeRequest: categoryChange.requestCategoryChange,
      onFormReady: setEditForm,
      onSubmit: saveState.saveAd,
      savePending: saveState.isSavePending
    }
  }, [
    ad,
    categoryChange.requestCategoryChange,
    draft.draftSavedAt,
    saveState.isSavePending,
    saveState.saveAd
  ])
  const dialogs = useMemo(
    () => ({
      categoryChange: {
        nextCategory: categoryChange.requestedCategory,
        onCancel: categoryChange.cancelCategoryChange,
        onConfirm: categoryChange.confirmCategoryChange,
        open: categoryChange.isCategoryChangeDialogOpen
      },
      draftRestore: {
        onRestoreDraft: draft.restoreDraft,
        onUseServerVersion: draft.useServerVersion,
        open: draft.isRestoreDialogOpen
      }
    }),
    [
      categoryChange.cancelCategoryChange,
      categoryChange.confirmCategoryChange,
      categoryChange.isCategoryChangeDialogOpen,
      categoryChange.requestedCategory,
      draft.isRestoreDialogOpen,
      draft.restoreDraft,
      draft.useServerVersion
    ]
  )

  const screenState = getScreenState(adId, backHref, detailQuery)

  if (screenState !== null) {
    return screenState
  }

  if (
    adId === null ||
    ad === undefined ||
    aiSection === null ||
    footerSection === null ||
    formSection === null
  ) {
    return {
      backHref,
      state: "loading"
    }
  }

  return {
    aiSection,
    dialogs,
    footerSection,
    formSection,
    state: "ready"
  }
}

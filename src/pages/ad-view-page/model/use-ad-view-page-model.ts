import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useLocation, useParams } from "react-router-dom"

import { adDetailQuery, cancelAdDetailQuery } from "@/entities/ad/api"

import {
  buildAdEditHref,
  parseAdViewPageId,
  resolveAdViewNavigationState
} from "./ad-view-page.navigation"
import { getAdViewPageScreenState } from "./ad-view-page.screen-state"

import type { AdViewPageModel } from "./ad-view-page.contract"

export function useAdViewPageModel(): AdViewPageModel {
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const adId = parseAdViewPageId(id)
  const { backHref, editState } = resolveAdViewNavigationState(location.state)
  const detailQuery = useQuery({
    ...adDetailQuery(adId ?? 0),
    enabled: adId !== null
  })

  useEffect(() => {
    if (adId === null) {
      return
    }

    return () => {
      void cancelAdDetailQuery(queryClient, adId)
    }
  }, [adId, queryClient])

  const screenState = getAdViewPageScreenState({
    ad: detailQuery.data,
    adId,
    backHref,
    error: detailQuery.error,
    isError: detailQuery.isError,
    isPending: detailQuery.isPending,
    onRetry: () => {
      void detailQuery.refetch()
    }
  })

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
    backHref,
    editHref: buildAdEditHref(adId),
    editState,
    state: "ready"
  }
}

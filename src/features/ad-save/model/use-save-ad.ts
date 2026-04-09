import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { invalidateAdAfterSave, updateAdMutation } from "@/entities/ad/api"
import {
  type AdEditFormValues,
  type AdsListNavigationState,
  toItemPatch
} from "@/entities/ad/model"
import { isAppApiError } from "@/shared/api/error"

import { clearAdDraftAndChatStorage } from "./ad-save.storage"

interface UseSaveAdOptions {
  itemId: number
  navigationState?: AdsListNavigationState
}

interface UseSaveAdResult {
  isSavePending: boolean
  saveAd: (values: AdEditFormValues) => Promise<void>
}

function getAdViewPath(itemId: number): string {
  return `/ads/${itemId}`
}

function getErrorToastMessage(error: unknown): string {
  if (isAppApiError(error)) {
    return error.message
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message
  }

  return "Не удалось сохранить объявление."
}

export function useSaveAd({
  itemId,
  navigationState
}: UseSaveAdOptions): UseSaveAdResult {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { isPending, mutateAsync } = useMutation({
    ...updateAdMutation(itemId),
    onError: error => {
      toast.error(getErrorToastMessage(error))
    },
    onSuccess: async () => {
      await invalidateAdAfterSave(queryClient, itemId)

      clearAdDraftAndChatStorage(itemId)
      toast.success("Объявление сохранено.")

      await navigate(getAdViewPath(itemId), {
        state: navigationState
      })
    }
  })

  const saveAd = useCallback(
    async (values: AdEditFormValues) => {
      const abortController = new AbortController()

      await mutateAsync({
        item: toItemPatch(values),
        signal: abortController.signal
      })
    },
    [mutateAsync]
  )

  return useMemo(
    () => ({
      isSavePending: isPending,
      saveAd
    }),
    [isPending, saveAd]
  )
}

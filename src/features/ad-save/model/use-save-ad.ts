import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { adsKeys, updateAdMutation, type AdEditFormValues } from "@/entities/ad"
import { isAppApiError } from "@/shared/api/error"
import { draftRegistryStore } from "@/shared/lib/draft-registry-store"

import { mapAdEditFormValuesToItemUpdateIn } from "./ad-save.payload"
import { clearAdDraftAndChatStorage } from "./ad-save.storage"

interface UseSaveAdOptions {
  itemId: number
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

export function useSaveAd({ itemId }: UseSaveAdOptions): UseSaveAdResult {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const mutation = useMutation({
    ...updateAdMutation(itemId),
    onError: error => {
      toast.error(getErrorToastMessage(error))
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adsKeys.detail(itemId) }),
        queryClient.invalidateQueries({ queryKey: adsKeys.editDetail(itemId) }),
        queryClient.invalidateQueries({ queryKey: adsKeys.lists() })
      ])

      clearAdDraftAndChatStorage(itemId)
      draftRegistryStore.getState().clearDraftMeta(itemId)
      toast.success("Объявление сохранено.")

      await navigate(getAdViewPath(itemId))
    }
  })

  const saveAd = useCallback(
    async (values: AdEditFormValues) => {
      const abortController = new AbortController()

      await mutation.mutateAsync({
        item: mapAdEditFormValuesToItemUpdateIn(values),
        signal: abortController.signal
      })
    },
    [mutation]
  )

  return {
    isSavePending: mutation.isPending,
    saveAd
  }
}

import { useCallback, useState } from "react"

import type { AdEditFormValues } from "@/entities/ad/model"

interface CategoryChangeRequest {
  nextCategory: AdEditFormValues["category"]
  onConfirm: () => void
}

interface UseCategoryChangeConfirmResult {
  cancelCategoryChange: () => void
  confirmCategoryChange: () => void
  isCategoryChangeDialogOpen: boolean
  requestCategoryChange: (request: CategoryChangeRequest) => void
  requestedCategory: AdEditFormValues["category"] | null
}

export function useCategoryChangeConfirm(): UseCategoryChangeConfirmResult {
  const [pendingRequest, setPendingRequest] =
    useState<CategoryChangeRequest | null>(null)

  const requestCategoryChange = useCallback(
    (request: CategoryChangeRequest) => {
      setPendingRequest(request)
    },
    []
  )

  const cancelCategoryChange = useCallback(() => {
    setPendingRequest(null)
  }, [])

  const confirmCategoryChange = useCallback(() => {
    if (!pendingRequest) {
      return
    }

    pendingRequest.onConfirm()
    setPendingRequest(null)
  }, [pendingRequest])

  return {
    cancelCategoryChange,
    confirmCategoryChange,
    isCategoryChangeDialogOpen: pendingRequest !== null,
    requestCategoryChange,
    requestedCategory: pendingRequest?.nextCategory ?? null
  }
}

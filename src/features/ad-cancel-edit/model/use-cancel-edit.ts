import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import type { AdsListNavigationState } from "@/entities/ad"

interface UseCancelEditOptions {
  itemId: number
  navigationState?: AdsListNavigationState
}

interface UseCancelEditResult {
  cancelEdit: () => Promise<void>
}

function getAdViewPath(itemId: number): string {
  return `/ads/${itemId}`
}

export function useCancelEdit({
  itemId,
  navigationState
}: UseCancelEditOptions): UseCancelEditResult {
  const navigate = useNavigate()

  const cancelEdit = useCallback(async () => {
    await navigate(getAdViewPath(itemId), {
      state: navigationState
    })
  }, [itemId, navigate, navigationState])

  return { cancelEdit }
}

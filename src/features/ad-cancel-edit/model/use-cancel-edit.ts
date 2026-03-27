import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

interface UseCancelEditOptions {
  itemId: number
}

interface UseCancelEditResult {
  cancelEdit: () => Promise<void>
}

function getAdViewPath(itemId: number): string {
  return `/ads/${itemId}`
}

export function useCancelEdit({
  itemId
}: UseCancelEditOptions): UseCancelEditResult {
  const navigate = useNavigate()

  const cancelEdit = useCallback(async () => {
    await navigate(getAdViewPath(itemId))
  }, [itemId, navigate])

  return { cancelEdit }
}

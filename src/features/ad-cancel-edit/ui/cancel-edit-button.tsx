import type { AdsListNavigationState } from "@/entities/ad-list"
import { Button } from "@/shared/ui/shadcn"

import { useCancelEdit } from "../model"

export interface CancelEditButtonProps {
  itemId: number
  disabled?: boolean
  navigationState?: AdsListNavigationState
}

export function CancelEditButton({
  itemId,
  disabled = false,
  navigationState
}: CancelEditButtonProps) {
  const { cancelEdit } = useCancelEdit({ itemId, navigationState })

  return (
    <Button
      className="min-w-28"
      disabled={disabled}
      size="sm"
      type="button"
      variant="outline"
      onClick={() => {
        void cancelEdit()
      }}
    >
      Отмена
    </Button>
  )
}

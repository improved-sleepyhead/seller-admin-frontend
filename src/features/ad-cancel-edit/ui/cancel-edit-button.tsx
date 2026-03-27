import { Button } from "@/shared/ui/shadcn"

import { useCancelEdit } from "../model"

export interface CancelEditButtonProps {
  itemId: number
  disabled?: boolean
}

export function CancelEditButton({ itemId, disabled = false }: CancelEditButtonProps) {
  const { cancelEdit } = useCancelEdit({ itemId })

  return (
    <Button
      disabled={disabled}
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

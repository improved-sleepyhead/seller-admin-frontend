import { AD_CATEGORY_LABELS, type AdEditFormValues } from "@/entities/ad"
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/shared/ui/shadcn"

interface CategoryChangeConfirmDialogProps {
  nextCategory: AdEditFormValues["category"] | null
  onCancel: () => void
  onConfirm: () => void
  open: boolean
}

export function CategoryChangeConfirmDialog({
  nextCategory,
  onCancel,
  onConfirm,
  open
}: CategoryChangeConfirmDialogProps) {
  if (!nextCategory) {
    return null
  }

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          onCancel()
        }
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Сменить категорию?</DialogTitle>
          <DialogDescription>
            После подтверждения несовместимые параметры будут очищены. Новая
            категория: {AD_CATEGORY_LABELS[nextCategory]}.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="button" onClick={onConfirm}>
            Подтвердить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

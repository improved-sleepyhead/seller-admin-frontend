import { AD_CATEGORY_LABELS, type AdEditFormValues } from "@/entities/ad"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
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
    <AlertDialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          onCancel()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Сменить категорию?</AlertDialogTitle>
          <AlertDialogDescription>
            После подтверждения несовместимые параметры будут очищены. Новая
            категория: {AD_CATEGORY_LABELS[nextCategory]}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel type="button" onClick={onCancel}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction type="button" onClick={onConfirm}>
            Подтвердить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

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

interface DraftRestoreDialogProps {
  onRestoreDraft: () => void
  onUseServerVersion: () => void
  open: boolean
}

export function DraftRestoreDialog({
  onRestoreDraft,
  onUseServerVersion,
  open
}: DraftRestoreDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={() => undefined}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Найден локальный черновик</AlertDialogTitle>
          <AlertDialogDescription>
            Найдены несохранённые изменения для этого объявления.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel type="button" onClick={onUseServerVersion}>
            Открыть актуальную версию
          </AlertDialogCancel>
          <AlertDialogAction type="button" onClick={onRestoreDraft}>
            Восстановить черновик
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

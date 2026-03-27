import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
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
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Найден локальный черновик</DialogTitle>
          <DialogDescription>
            Найдены несохранённые изменения для этого объявления.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={onUseServerVersion}>
            Открыть актуальную версию
          </Button>
          <Button type="button" onClick={onRestoreDraft}>
            Восстановить черновик
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import {
  Button,
  Dialog,
  DialogContent,
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
        </DialogHeader>

        <p className="text-muted-foreground text-sm">
          Найдены несохранённые изменения для этого объявления.
        </p>

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

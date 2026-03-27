import { Button } from "@/shared/ui/shadcn"

export interface SaveAdButtonProps {
  disabled: boolean
  isPending: boolean
}

export function SaveAdButton({ disabled, isPending }: SaveAdButtonProps) {
  return (
    <Button disabled={disabled} type="submit">
      {isPending ? "Сохраняем..." : "Сохранить"}
    </Button>
  )
}

import { Button } from "@/shared/ui/shadcn"

export interface SaveAdButtonProps {
  disabled: boolean
  form?: string
  isPending: boolean
}

export function SaveAdButton({ disabled, form, isPending }: SaveAdButtonProps) {
  return (
    <Button disabled={disabled} form={form} type="submit">
      {isPending ? "Сохраняем..." : "Сохранить"}
    </Button>
  )
}

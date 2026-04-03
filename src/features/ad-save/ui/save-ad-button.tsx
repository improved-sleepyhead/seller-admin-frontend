import { Button } from "@/shared/ui/shadcn"

export interface SaveAdButtonProps {
  disabled: boolean
  form?: string
  isPending: boolean
}

export function SaveAdButton({ disabled, form, isPending }: SaveAdButtonProps) {
  return (
    <Button
      className="min-w-28 justify-center"
      disabled={disabled || isPending}
      form={form}
      size="sm"
      type="submit"
    >
      Сохранить
    </Button>
  )
}

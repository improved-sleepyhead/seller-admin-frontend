import { Button } from "@/shared/ui/shadcn"

export interface SaveAdButtonProps {
  disabled: boolean
  form?: string
  isPending: boolean
}

export function SaveAdButton({ disabled, form, isPending }: SaveAdButtonProps) {
  return (
    <Button
      className="min-w-[8.5rem]"
      disabled={disabled}
      form={form}
      size="sm"
      type="submit"
    >
      {isPending ? "Сохраняем..." : "Сохранить"}
    </Button>
  )
}

import { Button } from "@/shared/ui/shadcn"

interface AiPriceActionProps {
  disabled: boolean
}

export function AiPriceAction({ disabled }: AiPriceActionProps) {
  return (
    <Button className="w-full" disabled={disabled} type="button" variant="outline">
      Предложить цену
    </Button>
  )
}

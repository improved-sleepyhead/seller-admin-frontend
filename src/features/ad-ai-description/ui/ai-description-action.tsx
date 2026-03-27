import { Button } from "@/shared/ui/shadcn"

interface AiDescriptionActionProps {
  disabled: boolean
}

export function AiDescriptionAction({ disabled }: AiDescriptionActionProps) {
  return (
    <Button className="w-full" disabled={disabled} type="button" variant="outline">
      Улучшить описание
    </Button>
  )
}

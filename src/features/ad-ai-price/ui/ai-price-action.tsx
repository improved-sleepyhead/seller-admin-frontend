import { LightbulbIcon } from "lucide-react"

import { Loader } from "@/shared/ui/loader"
import {
  Button,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/shared/ui/shadcn"

import { useAiPriceAction, type AdEditFormApi } from "../model"
import { getViewModel } from "./ai-price-action.view-model"
import { ResultContent } from "./ai-price-result-content"

interface AiPriceActionProps {
  className?: string
  disabled: boolean
  form: AdEditFormApi | null
}

export function AiPriceAction({
  className,
  disabled,
  form
}: AiPriceActionProps) {
  const action = useAiPriceAction({
    disabled,
    form
  })
  const viewModel = getViewModel(action)

  const triggerButton = (
    <Button
      className={className}
      disabled={!viewModel.trigger.canStart}
      size="xs"
      type="button"
      variant="ai"
      onClick={() => {
        void viewModel.trigger.start()
      }}
    >
      <LightbulbIcon className="size-3.5" />
      {viewModel.trigger.isPending ? (
        <>
          <Loader />
          Генерируем...
        </>
      ) : (
        "Предложить цену"
      )}
    </Button>
  )

  const panelContent = <ResultContent content={viewModel.content} />

  if (viewModel.panel.isMobile) {
    return (
      <>
        {triggerButton}
        <Sheet
          open={viewModel.panel.isOpen}
          onOpenChange={viewModel.panel.setOpen}
        >
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>AI-предложение цены</SheetTitle>
              <SheetDescription>
                Оценка формируется на основе текущих данных объявления.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4">{panelContent}</div>
            <SheetFooter />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <Popover
      open={viewModel.panel.isOpen}
      onOpenChange={viewModel.panel.setOpen}
    >
      <PopoverAnchor asChild>{triggerButton}</PopoverAnchor>
      <PopoverContent align="start" className="w-[24rem] space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">AI-предложение цены</h3>
          <p className="text-muted-foreground text-xs">
            Оценка формируется на основе текущих данных объявления.
          </p>
        </div>
        {panelContent}
      </PopoverContent>
    </Popover>
  )
}

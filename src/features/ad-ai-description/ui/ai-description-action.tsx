import { lazy, Suspense } from "react"

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

import { type AdEditFormApi, useAiDescriptionAction } from "../model"
import { getViewModel } from "./ai-description-action.view-model"
import { ResultContent } from "./ai-description-result-content"

const LazyAdDiffViewer = lazy(async () => {
  const module = await import("@/features/ad-diff-viewer")

  return { default: module.AdDiffViewer }
})

interface AiDescriptionActionProps {
  disabled: boolean
  form: AdEditFormApi | null
}

export function AiDescriptionAction({
  disabled,
  form
}: AiDescriptionActionProps) {
  const action = useAiDescriptionAction({
    disabled,
    form
  })
  const viewModel = getViewModel(action)
  const diffViewModel = viewModel.diff

  const triggerButton = (
    <Button
      className="w-full"
      disabled={!viewModel.trigger.canStart}
      type="button"
      variant="outline"
      onClick={() => {
        void viewModel.trigger.start()
      }}
    >
      {viewModel.trigger.isPending ? (
        <>
          <Loader />
          Генерируем описание...
        </>
      ) : (
        "Улучшить описание"
      )}
    </Button>
  )

  const resultContent = <ResultContent content={viewModel.content} />

  return (
    <>
      {viewModel.panel.isMobile ? (
        <>
          {triggerButton}
          <Sheet
            open={viewModel.panel.isOpen}
            onOpenChange={viewModel.panel.setOpen}
          >
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>AI-улучшение описания</SheetTitle>
                <SheetDescription>
                  Предложение сформировано из текущих данных объявления.
                </SheetDescription>
              </SheetHeader>
              <div className="px-4">{resultContent}</div>
              <SheetFooter />
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <Popover
          open={viewModel.panel.isOpen}
          onOpenChange={viewModel.panel.setOpen}
        >
          <PopoverAnchor asChild>{triggerButton}</PopoverAnchor>
          <PopoverContent align="start" className="w-[26rem] space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">AI-улучшение описания</h3>
              <p className="text-muted-foreground text-xs">
                Предложение сформировано из текущих данных объявления.
              </p>
            </div>
            {resultContent}
          </PopoverContent>
        </Popover>
      )}

      <Suspense fallback={null}>
        {diffViewModel?.isOpen ? (
          <LazyAdDiffViewer
            diff={diffViewModel.value}
            isMobile={viewModel.panel.isMobile}
            onOpenChange={nextOpen => {
              if (!nextOpen) {
                diffViewModel.close()
              }
            }}
            open={diffViewModel.isOpen}
          />
        ) : null}
      </Suspense>
    </>
  )
}

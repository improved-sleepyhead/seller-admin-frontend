import type { DescriptionDiffModel } from "../model"

interface AiDescriptionDiffViewModel {
  close: () => void
  isOpen: boolean
  open: () => void
  value: DescriptionDiffModel
}

interface AiDescriptionPanelViewModel {
  isMobile: boolean
  isOpen: boolean
  setOpen: (nextOpen: boolean) => void
}

interface AiDescriptionTriggerViewModel {
  canStart: boolean
  isPending: boolean
  start: () => Promise<void>
}

type AiDescriptionResultContentModel =
  | {
      actions: {
        cancel: () => void
      }
      status: "pending"
    }
  | {
      actions: {
        close: () => void
        retry: () => Promise<void>
      }
      errorMessage: string
      status: "error"
    }
  | {
      actions: {
        apply: () => void
        close: () => void
        openDiff: () => void
      }
      result: {
        text: string
      }
      status: "ready"
    }
  | {
      status: "idle"
    }

interface AiDescriptionActionViewModel {
  content: AiDescriptionResultContentModel
  diff: AiDescriptionDiffViewModel | null
  panel: AiDescriptionPanelViewModel
  trigger: AiDescriptionTriggerViewModel
}

interface AiDescriptionResultContentProps {
  content: AiDescriptionResultContentModel
}

type AiDescriptionContentStatus = AiDescriptionResultContentModel["status"]
type AiDescriptionPendingContent = Extract<
  AiDescriptionResultContentModel,
  { status: "pending" }
>
type AiDescriptionErrorContent = Extract<
  AiDescriptionResultContentModel,
  { status: "error" }
>
type AiDescriptionReadyContent = Extract<
  AiDescriptionResultContentModel,
  { status: "ready" }
>
type AiDescriptionIdleContent = Extract<
  AiDescriptionResultContentModel,
  { status: "idle" }
>

export type {
  AiDescriptionActionViewModel,
  AiDescriptionContentStatus,
  AiDescriptionErrorContent,
  AiDescriptionIdleContent,
  AiDescriptionPendingContent,
  AiDescriptionReadyContent,
  AiDescriptionResultContentModel,
  AiDescriptionResultContentProps
}

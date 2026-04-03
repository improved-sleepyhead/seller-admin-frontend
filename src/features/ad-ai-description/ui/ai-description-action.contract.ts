import type { DescriptionDiffModel } from "../model"

interface DiffView {
  close: () => void
  isOpen: boolean
  open: () => void
  value: DescriptionDiffModel
}

interface PanelView {
  isMobile: boolean
  isOpen: boolean
  setOpen: (nextOpen: boolean) => void
}

interface TriggerView {
  canStart: boolean
  isPending: boolean
  start: () => Promise<void>
}

type ContentModel =
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

interface ViewModel {
  content: ContentModel
  diff: DiffView | null
  panel: PanelView
  trigger: TriggerView
}

interface ContentProps {
  content: ContentModel
}

type ContentStatus = ContentModel["status"]
type PendingContent = Extract<ContentModel, { status: "pending" }>
type ErrorContent = Extract<ContentModel, { status: "error" }>
type ReadyContent = Extract<ContentModel, { status: "ready" }>
type IdleContent = Extract<ContentModel, { status: "idle" }>

export type {
  ContentModel,
  ContentProps,
  ContentStatus,
  ErrorContent,
  IdleContent,
  PendingContent,
  ReadyContent,
  ViewModel
}

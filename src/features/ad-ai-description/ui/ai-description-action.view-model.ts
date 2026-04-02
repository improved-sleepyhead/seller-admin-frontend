import type { useAiDescriptionAction } from "../model"
import type {
  ContentStatus,
  ErrorContent,
  IdleContent,
  PendingContent,
  ReadyContent,
  ViewModel
} from "./ai-description-action.contract"

type ActionModel = ReturnType<typeof useAiDescriptionAction>

function getReadyResult(action: ActionModel): ReadyContent["result"] | null {
  if (action.suggestion.text === null) {
    return null
  }

  return {
    text: action.suggestion.text
  }
}

const STATUS_RULES = [
  {
    matches: ({
      action
    }: {
      action: ActionModel
      readyResult: ReadyContent["result"] | null
    }) => action.request.isPending,
    status: "pending"
  },
  {
    matches: ({
      action
    }: {
      action: ActionModel
      readyResult: ReadyContent["result"] | null
    }) => action.request.errorMessage !== null,
    status: "error"
  },
  {
    matches: ({
      readyResult
    }: {
      action: ActionModel
      readyResult: ReadyContent["result"] | null
    }) => readyResult !== null,
    status: "ready"
  }
] as const satisfies readonly {
  matches: (args: {
    action: ActionModel
    readyResult: ReadyContent["result"] | null
  }) => boolean
  status: ContentStatus
}[]

function getContentStatus(action: ActionModel): ContentStatus {
  const readyResult = getReadyResult(action)

  return (
    STATUS_RULES.find(rule =>
      rule.matches({
        action,
        readyResult
      })
    )?.status ?? "idle"
  )
}

const CONTENT_BUILDERS = {
  error: (action: ActionModel): ErrorContent => ({
    actions: {
      close: action.panel.close,
      retry: action.request.retry
    },
    errorMessage: action.request.errorMessage ?? "",
    status: "error"
  }),
  idle: (): IdleContent => ({
    status: "idle"
  }),
  pending: (action: ActionModel): PendingContent => ({
    actions: {
      cancel: action.request.cancel
    },
    status: "pending"
  }),
  ready: (action: ActionModel): ReadyContent => ({
    actions: {
      apply: action.suggestion.apply,
      close: action.panel.close,
      openDiff: action.diff.open
    },
    result: getReadyResult(action) ?? {
      text: ""
    },
    status: "ready"
  })
} satisfies {
  [Status in ContentStatus]: (
    action: ActionModel
  ) => Extract<ViewModel["content"], { status: Status }>
}

function getViewModel(action: ActionModel): ViewModel {
  const contentStatus = getContentStatus(action)
  const content = CONTENT_BUILDERS[contentStatus](action)

  return {
    content,
    diff:
      action.diff.value === null
        ? null
        : {
            close: action.diff.close,
            isOpen: action.diff.isOpen,
            open: action.diff.open,
            value: action.diff.value
          },
    panel: {
      isMobile: action.panel.isMobile,
      isOpen: action.panel.isOpen,
      setOpen: action.panel.setOpen
    },
    trigger: {
      canStart: action.request.canStart,
      isPending: action.request.isPending,
      start: action.request.start
    }
  }
}

export { getViewModel }

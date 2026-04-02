import type { useAiDescriptionAction } from "../model"
import type {
  AiDescriptionActionViewModel,
  AiDescriptionContentStatus,
  AiDescriptionErrorContent,
  AiDescriptionIdleContent,
  AiDescriptionPendingContent,
  AiDescriptionReadyContent
} from "./ai-description-action.contract"

type AiDescriptionActionModel = ReturnType<typeof useAiDescriptionAction>

function getAiDescriptionReadyResult(
  action: AiDescriptionActionModel
): AiDescriptionReadyContent["result"] | null {
  if (action.suggestion.text === null) {
    return null
  }

  return {
    text: action.suggestion.text
  }
}

const AI_DESCRIPTION_CONTENT_STATUS_RULES = [
  {
    matches: ({
      action
    }: {
      action: AiDescriptionActionModel
      readyResult: AiDescriptionReadyContent["result"] | null
    }) => action.request.isPending,
    status: "pending"
  },
  {
    matches: ({
      action
    }: {
      action: AiDescriptionActionModel
      readyResult: AiDescriptionReadyContent["result"] | null
    }) => action.request.errorMessage !== null,
    status: "error"
  },
  {
    matches: ({
      readyResult
    }: {
      action: AiDescriptionActionModel
      readyResult: AiDescriptionReadyContent["result"] | null
    }) => readyResult !== null,
    status: "ready"
  }
] as const satisfies readonly {
  matches: (args: {
    action: AiDescriptionActionModel
    readyResult: AiDescriptionReadyContent["result"] | null
  }) => boolean
  status: AiDescriptionContentStatus
}[]

function getAiDescriptionContentStatus(
  action: AiDescriptionActionModel
): AiDescriptionContentStatus {
  const readyResult = getAiDescriptionReadyResult(action)

  return (
    AI_DESCRIPTION_CONTENT_STATUS_RULES.find(rule =>
      rule.matches({
        action,
        readyResult
      })
    )?.status ?? "idle"
  )
}

const AI_DESCRIPTION_CONTENT_BUILDERS = {
  error: (action: AiDescriptionActionModel): AiDescriptionErrorContent => ({
    actions: {
      close: action.panel.close,
      retry: action.request.retry
    },
    errorMessage: action.request.errorMessage ?? "",
    status: "error"
  }),
  idle: (): AiDescriptionIdleContent => ({
    status: "idle"
  }),
  pending: (action: AiDescriptionActionModel): AiDescriptionPendingContent => ({
    actions: {
      cancel: action.request.cancel
    },
    status: "pending"
  }),
  ready: (action: AiDescriptionActionModel): AiDescriptionReadyContent => ({
    actions: {
      apply: action.suggestion.apply,
      close: action.panel.close,
      openDiff: action.diff.open
    },
    result: getAiDescriptionReadyResult(action) ?? {
      text: ""
    },
    status: "ready"
  })
} satisfies {
  [Status in AiDescriptionContentStatus]: (
    action: AiDescriptionActionModel
  ) => Extract<AiDescriptionActionViewModel["content"], { status: Status }>
}

function getAiDescriptionActionViewModel(
  action: AiDescriptionActionModel
): AiDescriptionActionViewModel {
  const contentStatus = getAiDescriptionContentStatus(action)
  const content = AI_DESCRIPTION_CONTENT_BUILDERS[contentStatus](action)

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

export { getAiDescriptionActionViewModel }

import type { useAiPriceAction } from "../model"
import type {
  AiPriceActionViewModel,
  AiPriceContentStatus,
  AiPriceErrorContent,
  AiPriceIdleContent,
  AiPricePendingContent,
  AiPriceReadyContent
} from "./ai-price-action.contract"

type AiPriceActionModel = ReturnType<typeof useAiPriceAction>

function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    currency: "RUB",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value)
}

function getAiPriceReadyResult(
  action: AiPriceActionModel
): AiPriceReadyContent["result"] | null {
  const response = action.suggestion.response

  if (
    response?.suggestedPrice === undefined ||
    response.reasoning === undefined
  ) {
    return null
  }

  return {
    priceLabel: formatPrice(response.suggestedPrice),
    reasoning: response.reasoning
  }
}

const AI_PRICE_CONTENT_STATUS_RULES = [
  {
    matches: ({
      action
    }: {
      action: AiPriceActionModel
      readyResult: AiPriceReadyContent["result"] | null
    }) => action.request.isPending,
    status: "pending"
  },
  {
    matches: ({
      action
    }: {
      action: AiPriceActionModel
      readyResult: AiPriceReadyContent["result"] | null
    }) => action.request.errorMessage !== null,
    status: "error"
  },
  {
    matches: ({
      readyResult
    }: {
      action: AiPriceActionModel
      readyResult: AiPriceReadyContent["result"] | null
    }) => readyResult !== null,
    status: "ready"
  }
] as const satisfies readonly {
  matches: (args: {
    action: AiPriceActionModel
    readyResult: AiPriceReadyContent["result"] | null
  }) => boolean
  status: AiPriceContentStatus
}[]

function getAiPriceContentStatus(
  action: AiPriceActionModel
): AiPriceContentStatus {
  const readyResult = getAiPriceReadyResult(action)

  return (
    AI_PRICE_CONTENT_STATUS_RULES.find(rule =>
      rule.matches({
        action,
        readyResult
      })
    )?.status ?? "idle"
  )
}

const AI_PRICE_CONTENT_BUILDERS = {
  error: (action: AiPriceActionModel): AiPriceErrorContent => ({
    actions: {
      close: action.panel.close,
      retry: action.request.retry
    },
    errorMessage: action.request.errorMessage ?? "",
    status: "error"
  }),
  idle: (): AiPriceIdleContent => ({
    status: "idle"
  }),
  pending: (action: AiPriceActionModel): AiPricePendingContent => ({
    actions: {
      cancel: action.request.cancel
    },
    status: "pending"
  }),
  ready: (action: AiPriceActionModel): AiPriceReadyContent => ({
    actions: {
      apply: action.suggestion.apply,
      close: action.panel.close,
      retry: action.request.retry
    },
    result: getAiPriceReadyResult(action) ?? {
      priceLabel: "",
      reasoning: ""
    },
    status: "ready"
  })
} satisfies {
  [Status in AiPriceContentStatus]: (
    action: AiPriceActionModel
  ) => Extract<AiPriceActionViewModel["content"], { status: Status }>
}

function getAiPriceActionViewModel(
  action: AiPriceActionModel
): AiPriceActionViewModel {
  const contentStatus = getAiPriceContentStatus(action)
  const content = AI_PRICE_CONTENT_BUILDERS[contentStatus](action)

  return {
    content,
    panel: action.panel,
    trigger: {
      canStart: action.request.canStart,
      isPending: action.request.isPending,
      start: action.request.start
    }
  }
}

export { getAiPriceActionViewModel }

interface AiPricePanelViewModel {
  close: () => void
  isMobile: boolean
  isOpen: boolean
  setOpen: (nextOpen: boolean) => void
}

interface AiPriceTriggerViewModel {
  canStart: boolean
  isPending: boolean
  start: () => Promise<void>
}

type AiPriceResultContentModel =
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
        retry: () => Promise<void>
      }
      result: {
        priceLabel: string
        reasoning: string
      }
      status: "ready"
    }
  | {
      status: "idle"
    }

interface AiPriceActionViewModel {
  content: AiPriceResultContentModel
  panel: AiPricePanelViewModel
  trigger: AiPriceTriggerViewModel
}

interface AiPriceResultContentProps {
  content: AiPriceResultContentModel
}

type AiPriceContentStatus = AiPriceResultContentModel["status"]
type AiPricePendingContent = Extract<
  AiPriceResultContentModel,
  { status: "pending" }
>
type AiPriceErrorContent = Extract<
  AiPriceResultContentModel,
  { status: "error" }
>
type AiPriceReadyContent = Extract<
  AiPriceResultContentModel,
  { status: "ready" }
>
type AiPriceIdleContent = Extract<AiPriceResultContentModel, { status: "idle" }>

export type {
  AiPriceActionViewModel,
  AiPriceContentStatus,
  AiPriceErrorContent,
  AiPriceIdleContent,
  AiPricePendingContent,
  AiPriceReadyContent,
  AiPriceResultContentModel,
  AiPriceResultContentProps
}

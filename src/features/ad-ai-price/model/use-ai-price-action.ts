import { useCallback } from "react"

import type { AiPriceResponse } from "@/entities/ad/api"
import type { AdEditFormApi } from "@/entities/ad/model"

import { useAiPriceRequest } from "./use-ai-price-request"
import { useAiPriceUiState } from "./use-ai-price-ui-state"

interface ActionOptions {
  disabled: boolean
  form: AdEditFormApi | null
}

interface RequestState {
  canStart: boolean
  cancel: () => void
  errorMessage: string | null
  isPending: boolean
  retry: () => Promise<void>
  start: () => Promise<void>
}

interface PanelState {
  close: () => void
  isMobile: boolean
  isOpen: boolean
  setOpen: (nextOpen: boolean) => void
}

interface SuggestionState {
  apply: () => void
  response: AiPriceResponse | null
}

interface ActionState {
  panel: PanelState
  request: RequestState
  suggestion: SuggestionState
}

export function useAiPriceAction({
  disabled,
  form
}: ActionOptions): ActionState {
  const request = useAiPriceRequest({
    disabled,
    form
  })
  const uiState = useAiPriceUiState({
    form,
    isRequestPending: request.isPending,
    response: request.response
  })

  const start = useCallback(async () => {
    await request.start({
      onStart: uiState.openResult
    })
  }, [request, uiState.openResult])

  const retry = useCallback(async () => {
    await request.retry({
      onStart: uiState.openResult
    })
  }, [request, uiState.openResult])

  const cancel = useCallback(() => {
    request.cancel()
    uiState.panel.close()
  }, [request, uiState.panel])

  return {
    panel: uiState.panel,
    request: {
      canStart: request.canStart,
      cancel,
      errorMessage: request.errorMessage,
      isPending: request.isPending,
      retry,
      start
    },
    suggestion: {
      apply: uiState.apply,
      response: request.response
    }
  }
}

export type { AdEditFormApi } from "@/entities/ad/model"

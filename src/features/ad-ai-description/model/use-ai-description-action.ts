import { useCallback } from "react"

import type { AdEditFormApi } from "@/entities/ad/model"

import { useAiDescriptionRequest } from "./use-ai-description-request"
import {
  useAiDescriptionUiState,
  type DescriptionDiffModel
} from "./use-ai-description-ui-state"

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
  text: string | null
}

interface DiffState {
  close: () => void
  isOpen: boolean
  open: () => void
  value: DescriptionDiffModel | null
}

interface ActionState {
  diff: DiffState
  panel: PanelState
  request: RequestState
  suggestion: SuggestionState
}

export function useAiDescriptionAction({
  disabled,
  form
}: ActionOptions): ActionState {
  const request = useAiDescriptionRequest({
    disabled,
    form
  })
  const uiState = useAiDescriptionUiState({
    form,
    isRequestPending: request.isPending,
    suggestionText: request.response?.suggestion ?? null
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
    diff: uiState.diff,
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
      text: request.response?.suggestion ?? null
    }
  }
}

export type { AdEditFormApi } from "@/entities/ad/model"
export type { DescriptionDiffModel } from "./use-ai-description-ui-state"

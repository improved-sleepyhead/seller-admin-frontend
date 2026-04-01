import { useMutation } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"

import {
  requestAiDescription,
  type AiDescriptionResponse,
  type ItemUpdateIn
} from "@/entities/ad/api"
import { ensureValidAiPayload, type AdEditFormApi } from "@/entities/ad/model"
import { isAppApiError } from "@/shared/api/error"

const MOBILE_MEDIA_QUERY = "(max-width: 767px)"

interface DescriptionDiffModel {
  sourceText: string
  suggestion: string
}

interface UseAiDescriptionActionOptions {
  disabled: boolean
  form: AdEditFormApi | null
}

interface AiDescriptionRequestController {
  canStart: boolean
  cancel: () => void
  errorMessage: string | null
  isPending: boolean
  retry: () => Promise<void>
  start: () => Promise<void>
}

interface AiDescriptionPanelController {
  close: () => void
  isMobile: boolean
  isOpen: boolean
  setOpen: (nextOpen: boolean) => void
}

interface AiDescriptionSuggestionController {
  apply: () => void
  text: string | null
}

interface AiDescriptionDiffController {
  close: () => void
  isOpen: boolean
  open: () => void
  value: DescriptionDiffModel | null
}

interface UseAiDescriptionActionResult {
  diff: AiDescriptionDiffController
  panel: AiDescriptionPanelController
  request: AiDescriptionRequestController
  suggestion: AiDescriptionSuggestionController
}

function getAiDescriptionErrorMessage(error: unknown): string {
  if (isAppApiError(error)) {
    return error.message
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message
  }

  return "Не удалось получить AI-предложение описания."
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.matchMedia(MOBILE_MEDIA_QUERY).matches
  })

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY)
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    setIsMobile(mediaQueryList.matches)
    mediaQueryList.addEventListener("change", handleChange)

    return () => {
      mediaQueryList.removeEventListener("change", handleChange)
    }
  }, [])

  return isMobile
}

export function useAiDescriptionAction({
  disabled,
  form
}: UseAiDescriptionActionOptions): UseAiDescriptionActionResult {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPreparing, setIsPreparing] = useState(false)
  const [isDiffViewerOpen, setIsDiffViewerOpen] = useState(false)
  const [isResultOpen, setIsResultOpen] = useState(false)
  const [response, setResponse] = useState<AiDescriptionResponse | null>(null)
  const [visibleDiff, setVisibleDiff] = useState<DescriptionDiffModel | null>(
    null
  )
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastAppliedDiffRef = useRef<DescriptionDiffModel | null>(null)
  const isMobile = useIsMobile()
  const mutation = useMutation({
    mutationFn: ({
      item,
      signal
    }: {
      item: ItemUpdateIn
      signal: AbortSignal
    }): Promise<AiDescriptionResponse> => requestAiDescription(item, signal)
  })

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current === null) {
      return
    }

    abortControllerRef.current.abort()
    abortControllerRef.current = null
    setIsPreparing(false)
    mutation.reset()
    setIsResultOpen(false)
  }, [mutation, setIsPreparing])

  const closeResult = useCallback(() => {
    setIsResultOpen(false)
  }, [])

  const requestSuggestion = useCallback(async () => {
    if (disabled || form === null || mutation.isPending || isPreparing) {
      return
    }

    setIsPreparing(true)
    const validationResult = await ensureValidAiPayload(form)

    if (!validationResult.isValid) {
      setErrorMessage("Заполните обязательные поля перед AI-запросом.")
      setResponse(null)
      setIsResultOpen(false)
      setIsPreparing(false)
      return
    }

    const requestAbortController = new AbortController()
    abortControllerRef.current = requestAbortController
    setErrorMessage(null)
    setResponse(null)
    setIsResultOpen(true)

    try {
      const nextResponse = await mutation.mutateAsync({
        item: validationResult.payload,
        signal: requestAbortController.signal
      })

      if (requestAbortController.signal.aborted) {
        return
      }

      setResponse(nextResponse)
    } catch (error) {
      if (requestAbortController.signal.aborted) {
        return
      }

      setErrorMessage(getAiDescriptionErrorMessage(error))
    } finally {
      setIsPreparing(false)
      if (abortControllerRef.current === requestAbortController) {
        abortControllerRef.current = null
      }
    }
  }, [disabled, form, isPreparing, mutation])

  const retrySuggestion = useCallback(async () => {
    await requestSuggestion()
  }, [requestSuggestion])

  const viewDiff = useCallback(() => {
    if (form !== null && response !== null) {
      setVisibleDiff({
        sourceText: form.getValues("description"),
        suggestion: response.suggestion
      })
      setIsDiffViewerOpen(true)
      return
    }

    if (lastAppliedDiffRef.current !== null) {
      setVisibleDiff(lastAppliedDiffRef.current)
      setIsDiffViewerOpen(true)
    }
  }, [form, response])

  const applySuggestion = useCallback(() => {
    if (response === null || form === null) {
      return
    }

    const previousDescription = form.getValues("description")
    const nextDiff: DescriptionDiffModel = {
      sourceText: previousDescription,
      suggestion: response.suggestion
    }

    lastAppliedDiffRef.current = nextDiff
    form.setValue("description", response.suggestion, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
    setVisibleDiff(nextDiff)
    setIsResultOpen(false)
  }, [form, response])

  const setResultOpen = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && (mutation.isPending || isPreparing)) {
        return
      }

      if (!nextOpen) {
        closeResult()
        return
      }

      setIsResultOpen(true)
    },
    [closeResult, isPreparing, mutation.isPending]
  )

  const closeDiffViewer = useCallback(() => {
    setIsDiffViewerOpen(false)
  }, [])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current !== null) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

  return {
    diff: {
      close: closeDiffViewer,
      isOpen: isDiffViewerOpen,
      open: viewDiff,
      value: visibleDiff
    },
    panel: {
      close: closeResult,
      isMobile,
      isOpen: isResultOpen,
      setOpen: setResultOpen
    },
    request: {
      canStart:
        !disabled && form !== null && !mutation.isPending && !isPreparing,
      cancel: cancelRequest,
      errorMessage,
      isPending: mutation.isPending || isPreparing,
      retry: retrySuggestion,
      start: requestSuggestion
    },
    suggestion: {
      apply: applySuggestion,
      text: response?.suggestion ?? null
    }
  }
}

export type { AdEditFormApi, DescriptionDiffModel }

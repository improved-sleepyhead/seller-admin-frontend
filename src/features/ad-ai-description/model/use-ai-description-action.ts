import { useMutation } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"

import {
  ensureValidAiPayload,
  type AdEditFormApi,
  requestAiDescription,
  type AiDescriptionResponse,
  type ItemUpdateIn
} from "@/entities/ad"
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

interface UseAiDescriptionActionResult {
  applySuggestion: () => void
  cancelRequest: () => void
  canRequestSuggestion: boolean
  closeDiffViewer: () => void
  closeResult: () => void
  errorMessage: string | null
  isDiffViewerOpen: boolean
  isMobile: boolean
  isPending: boolean
  isResultOpen: boolean
  requestSuggestion: () => Promise<void>
  retrySuggestion: () => Promise<void>
  setResultOpen: (nextOpen: boolean) => void
  suggestionText: string | null
  viewDiff: () => void
  visibleDiff: DescriptionDiffModel | null
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
    mutation.reset()
  }, [mutation])

  const closeResult = useCallback(() => {
    if (mutation.isPending) {
      cancelRequest()
    }

    setIsResultOpen(false)
  }, [cancelRequest, mutation.isPending])

  const requestSuggestion = useCallback(async () => {
    if (disabled || form === null || mutation.isPending) {
      return
    }

    const validationResult = await ensureValidAiPayload(form)

    if (!validationResult.isValid) {
      setErrorMessage("Заполните обязательные поля перед AI-запросом.")
      setResponse(null)
      setIsResultOpen(true)
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
      if (abortControllerRef.current === requestAbortController) {
        abortControllerRef.current = null
      }
    }
  }, [disabled, form, mutation])

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
      if (!nextOpen) {
        closeResult()
        return
      }

      setIsResultOpen(true)
    },
    [closeResult]
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
    applySuggestion,
    cancelRequest,
    canRequestSuggestion: !disabled && form !== null && !mutation.isPending,
    closeDiffViewer,
    closeResult,
    errorMessage,
    isDiffViewerOpen,
    isMobile,
    isPending: mutation.isPending,
    isResultOpen,
    requestSuggestion,
    retrySuggestion,
    setResultOpen,
    suggestionText: response?.suggestion ?? null,
    viewDiff,
    visibleDiff
  }
}

export type { AdEditFormApi, DescriptionDiffModel }

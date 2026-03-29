import { useMutation } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"

import {
  ensureValidAiPayload,
  requestAiPrice,
  type AdEditFormApi,
  type AiPriceResponse,
  type ItemUpdateIn
} from "@/entities/ad"
import { isAppApiError } from "@/shared/api/error"

const MOBILE_MEDIA_QUERY = "(max-width: 767px)"

interface UseAiPriceActionOptions {
  disabled: boolean
  form: AdEditFormApi | null
}

interface UseAiPriceActionResult {
  applySuggestion: () => void
  canRequestSuggestion: boolean
  cancelRequest: () => void
  closeResult: () => void
  errorMessage: string | null
  isMobile: boolean
  isPending: boolean
  isResultOpen: boolean
  requestSuggestion: () => Promise<void>
  response: AiPriceResponse | null
  retrySuggestion: () => Promise<void>
  setResultOpen: (nextOpen: boolean) => void
}

function getAiPriceErrorMessage(error: unknown): string {
  if (isAppApiError(error)) {
    return error.message
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message
  }

  return "Не удалось получить AI-предложение цены."
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

export function useAiPriceAction({
  disabled,
  form
}: UseAiPriceActionOptions): UseAiPriceActionResult {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPreparing, setIsPreparing] = useState(false)
  const [isResultOpen, setIsResultOpen] = useState(false)
  const [response, setResponse] = useState<AiPriceResponse | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMobile = useIsMobile()
  const mutation = useMutation({
    mutationFn: ({
      item,
      signal
    }: {
      item: ItemUpdateIn
      signal: AbortSignal
    }): Promise<AiPriceResponse> => requestAiPrice(item, signal)
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

      setErrorMessage(getAiPriceErrorMessage(error))
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

  const applySuggestion = useCallback(() => {
    if (response === null || form === null) {
      return
    }

    form.setValue("price", response.suggestedPrice, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
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
    canRequestSuggestion:
      !disabled && form !== null && !mutation.isPending && !isPreparing,
    cancelRequest,
    closeResult,
    errorMessage,
    isMobile,
    isPending: mutation.isPending || isPreparing,
    isResultOpen,
    requestSuggestion,
    response,
    retrySuggestion,
    setResultOpen
  }
}

export type { AdEditFormApi }

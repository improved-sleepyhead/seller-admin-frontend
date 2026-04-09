import { useMutation } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"

import {
  requestAiPrice,
  type AiPriceResponse,
  type ItemUpdateIn
} from "@/entities/ad/api"
import { ensureValidAiPayload, type AdEditFormApi } from "@/entities/ad/lib"
import { isAppApiError } from "@/shared/api/error"

interface ActionOptions {
  disabled: boolean
  form: AdEditFormApi | null
}

interface StartOptions {
  onStart?: () => void
}

interface PriceRequestState {
  cancel: () => void
  canStart: boolean
  errorMessage: string | null
  isPending: boolean
  response: AiPriceResponse | null
  retry: (options?: StartOptions) => Promise<void>
  start: (options?: StartOptions) => Promise<void>
}

function getErrorMessage(error: unknown): string {
  if (isAppApiError(error)) {
    return error.message
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message
  }

  return "Не удалось получить AI-предложение цены."
}

function useAiPriceRequest({
  disabled,
  form
}: ActionOptions): PriceRequestState {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPreparing, setIsPreparing] = useState(false)
  const [response, setResponse] = useState<AiPriceResponse | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const mutation = useMutation({
    mutationFn: ({
      item,
      signal
    }: {
      item: ItemUpdateIn
      signal: AbortSignal
    }): Promise<AiPriceResponse> => requestAiPrice(item, signal)
  })

  const cancel = useCallback(() => {
    if (abortControllerRef.current === null) {
      return
    }

    abortControllerRef.current.abort()
    abortControllerRef.current = null
    setIsPreparing(false)
    mutation.reset()
  }, [mutation])

  const start = useCallback(
    async ({ onStart }: StartOptions = {}) => {
      if (disabled || form === null || mutation.isPending || isPreparing) {
        return
      }

      setIsPreparing(true)
      const validationResult = await ensureValidAiPayload(form)

      if (!validationResult.isValid) {
        setErrorMessage("Заполните обязательные поля перед AI-запросом.")
        setResponse(null)
        setIsPreparing(false)
        return
      }

      const requestAbortController = new AbortController()
      abortControllerRef.current = requestAbortController
      onStart?.()
      setErrorMessage(null)
      setResponse(null)

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

        setErrorMessage(getErrorMessage(error))
      } finally {
        setIsPreparing(false)
        if (abortControllerRef.current === requestAbortController) {
          abortControllerRef.current = null
        }
      }
    },
    [disabled, form, isPreparing, mutation]
  )

  const retry = useCallback(
    async (options?: StartOptions) => {
      await start(options)
    },
    [start]
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
    cancel,
    canStart: !disabled && form !== null && !mutation.isPending && !isPreparing,
    errorMessage,
    isPending: mutation.isPending || isPreparing,
    response,
    retry,
    start
  }
}

export { useAiPriceRequest }

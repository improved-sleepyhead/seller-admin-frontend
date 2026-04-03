import { useCallback, useEffect, useState } from "react"

import type { AiPriceResponse } from "@/entities/ad/api"
import type { AdEditFormApi } from "@/entities/ad/model"

const MOBILE_MEDIA_QUERY = "(max-width: 767px)"

interface PriceUiStateOptions {
  form: AdEditFormApi | null
  isRequestPending: boolean
  response: AiPriceResponse | null
}

interface PriceUiState {
  apply: () => void
  openResult: () => void
  panel: {
    close: () => void
    isMobile: boolean
    isOpen: boolean
    setOpen: (nextOpen: boolean) => void
  }
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

function useAiPriceUiState({
  form,
  isRequestPending,
  response
}: PriceUiStateOptions): PriceUiState {
  const [isResultOpen, setIsResultOpen] = useState(false)
  const isMobile = useIsMobile()

  const openResult = useCallback(() => {
    setIsResultOpen(true)
  }, [])

  const closeResult = useCallback(() => {
    setIsResultOpen(false)
  }, [])

  const apply = useCallback(() => {
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

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isRequestPending) {
        return
      }

      if (!nextOpen) {
        closeResult()
        return
      }

      openResult()
    },
    [closeResult, isRequestPending, openResult]
  )

  return {
    apply,
    openResult,
    panel: {
      close: closeResult,
      isMobile,
      isOpen: isResultOpen,
      setOpen
    }
  }
}

export { useAiPriceUiState }

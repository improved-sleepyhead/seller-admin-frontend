import { useCallback, useEffect, useRef, useState } from "react"

import type { AdEditFormApi } from "@/entities/ad/model"

const MOBILE_MEDIA_QUERY = "(max-width: 767px)"

interface DescriptionDiffModel {
  sourceText: string
  suggestion: string
}

interface DescriptionUiStateOptions {
  form: AdEditFormApi | null
  isRequestPending: boolean
  suggestionText: string | null
}

interface DescriptionUiState {
  apply: () => void
  diff: {
    close: () => void
    isOpen: boolean
    open: () => void
    value: DescriptionDiffModel | null
  }
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

function useAiDescriptionUiState({
  form,
  isRequestPending,
  suggestionText
}: DescriptionUiStateOptions): DescriptionUiState {
  const [isDiffViewerOpen, setIsDiffViewerOpen] = useState(false)
  const [isResultOpen, setIsResultOpen] = useState(false)
  const [visibleDiff, setVisibleDiff] = useState<DescriptionDiffModel | null>(
    null
  )
  const lastAppliedDiffRef = useRef<DescriptionDiffModel | null>(null)
  const restoreResultRef = useRef(false)
  const isMobile = useIsMobile()

  const openResult = useCallback(() => {
    restoreResultRef.current = false
    setIsResultOpen(true)
  }, [])

  const closeResult = useCallback(() => {
    restoreResultRef.current = false
    setIsResultOpen(false)
  }, [])

  const apply = useCallback(() => {
    if (suggestionText === null || form === null) {
      return
    }

    const nextDiff: DescriptionDiffModel = {
      sourceText: form.getValues("description"),
      suggestion: suggestionText
    }

    lastAppliedDiffRef.current = nextDiff
    restoreResultRef.current = false
    form.setValue("description", suggestionText, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
    setVisibleDiff(nextDiff)
    setIsResultOpen(false)
  }, [form, suggestionText])

  const openDiff = useCallback(() => {
    const shouldRestoreResult = !isMobile && isResultOpen
    restoreResultRef.current = shouldRestoreResult

    if (form !== null && suggestionText !== null) {
      setVisibleDiff({
        sourceText: form.getValues("description"),
        suggestion: suggestionText
      })

      if (shouldRestoreResult) {
        setIsResultOpen(false)
      }
      setIsDiffViewerOpen(true)
      return
    }

    if (lastAppliedDiffRef.current !== null) {
      setVisibleDiff(lastAppliedDiffRef.current)

      if (shouldRestoreResult) {
        setIsResultOpen(false)
      }
      setIsDiffViewerOpen(true)
    }
  }, [form, isMobile, isResultOpen, suggestionText])

  const closeDiff = useCallback(() => {
    setIsDiffViewerOpen(false)
    if (restoreResultRef.current) {
      restoreResultRef.current = false
      setIsResultOpen(true)
      return
    }

    restoreResultRef.current = false
  }, [])

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
    diff: {
      close: closeDiff,
      isOpen: isDiffViewerOpen,
      open: openDiff,
      value: visibleDiff
    },
    openResult,
    panel: {
      close: closeResult,
      isMobile,
      isOpen: isResultOpen,
      setOpen
    }
  }
}

export { useAiDescriptionUiState }
export type { DescriptionDiffModel }

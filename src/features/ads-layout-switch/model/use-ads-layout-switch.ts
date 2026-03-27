import { useCallback } from "react"
import { useSearchParams } from "react-router-dom"

import {
  createAdsSearchParams,
  parseAdsSearchParams,
  type AdsLayout
} from "@/entities/ad"

interface UseAdsLayoutSwitchResult {
  activeLayout: AdsLayout
  setLayout: (nextLayout: AdsLayout) => void
}

export function useAdsLayoutSwitch(): UseAdsLayoutSwitchResult {
  const [searchParams, setSearchParams] = useSearchParams()
  const normalizedParams = parseAdsSearchParams(searchParams)

  const setLayout = useCallback(
    (nextLayout: AdsLayout) => {
      const nextParams = parseAdsSearchParams(searchParams)

      setSearchParams(
        createAdsSearchParams({
          ...nextParams,
          layout: nextLayout
        })
      )
    },
    [searchParams, setSearchParams]
  )

  return {
    activeLayout: normalizedParams.layout,
    setLayout
  }
}

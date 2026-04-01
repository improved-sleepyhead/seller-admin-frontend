import { useEffect, useRef, useState } from "react"
import { useLocation, useSearchParams } from "react-router-dom"

import {
  parseAdsSearchParams,
  serializeAdsListUrlParams
} from "@/entities/ad/api"
import {
  adsListStateStore,
  getAdsListUrlParamsFromState
} from "@/entities/ad/model"

function toSearchWithoutPrefix(search: string): string {
  return search.startsWith("?") ? search.slice(1) : search
}

function toSearchParams(serializedSearch: string): URLSearchParams {
  return new URLSearchParams(serializedSearch)
}

export function useAdsListUrlSync(): { isHydrated: boolean } {
  const location = useLocation()
  const [, setSearchParams] = useSearchParams()
  const [isHydrated, setIsHydrated] = useState(false)
  const isHydratedRef = useRef(false)
  const isHydratingFromUrlRef = useRef(false)
  const syncedSearchRef = useRef("")

  useEffect(() => {
    isHydratedRef.current = isHydrated
  }, [isHydrated])

  useEffect(() => {
    const unsubscribe = adsListStateStore.subscribe(() => {
      if (!isHydratedRef.current || isHydratingFromUrlRef.current) {
        return
      }

      const serializedStoreSearch = serializeAdsListUrlParams(
        getAdsListUrlParamsFromState()
      )

      if (serializedStoreSearch === syncedSearchRef.current) {
        return
      }

      syncedSearchRef.current = serializedStoreSearch
      setSearchParams(toSearchParams(serializedStoreSearch), { replace: false })
    })

    return unsubscribe
  }, [setSearchParams])

  useEffect(() => {
    const rawSearch = toSearchWithoutPrefix(location.search)
    const normalizedParams = parseAdsSearchParams(
      new URLSearchParams(rawSearch)
    )
    const canonicalSearch = serializeAdsListUrlParams(normalizedParams)

    syncedSearchRef.current = canonicalSearch
    isHydratingFromUrlRef.current = true

    adsListStateStore.getState().hydrateFromUrl(normalizedParams)

    isHydratingFromUrlRef.current = false
    setIsHydrated(true)

    if (rawSearch === canonicalSearch) {
      return
    }

    setSearchParams(toSearchParams(canonicalSearch), { replace: true })
  }, [location.search, setSearchParams])

  return { isHydrated }
}

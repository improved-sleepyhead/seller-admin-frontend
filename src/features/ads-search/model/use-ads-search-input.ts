import { debounce } from "lodash"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { createAdsSearchParams, parseAdsSearchParams } from "@/entities/ad"

const SEARCH_DEBOUNCE_MS = 400

interface UseAdsSearchInputResult {
  queryValue: string
  setQueryValue: (nextValue: string) => void
}

export function useAdsSearchInput(): UseAdsSearchInputResult {
  const [searchParams, setSearchParams] = useSearchParams()
  const [queryValue, setQueryValueState] = useState(() => {
    return parseAdsSearchParams(searchParams).q
  })
  const searchParamsRef = useRef(searchParams)

  useEffect(() => {
    searchParamsRef.current = searchParams
    const normalizedQuery = parseAdsSearchParams(searchParams).q

    setQueryValueState(currentValue =>
      currentValue === normalizedQuery ? currentValue : normalizedQuery
    )
  }, [searchParams])

  const debouncedSyncQuery = useMemo(() => {
    return debounce((nextValue: string) => {
      const normalizedParams = parseAdsSearchParams(searchParamsRef.current)

      setSearchParams(
        createAdsSearchParams({
          ...normalizedParams,
          page: 1,
          q: nextValue
        })
      )
    }, SEARCH_DEBOUNCE_MS)
  }, [setSearchParams])

  useEffect(() => {
    return () => {
      debouncedSyncQuery.cancel()
    }
  }, [debouncedSyncQuery])

  const setQueryValue = useCallback(
    (nextValue: string) => {
      setQueryValueState(nextValue)
      debouncedSyncQuery(nextValue)
    },
    [debouncedSyncQuery]
  )

  return {
    queryValue,
    setQueryValue
  }
}

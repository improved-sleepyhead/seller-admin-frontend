import { debounce } from "lodash"
import { useCallback, useEffect, useMemo, useState } from "react"

import { useAdsListState } from "@/entities/ad"

const SEARCH_DEBOUNCE_MS = 400

interface UseAdsSearchInputResult {
  queryValue: string
  setQueryValue: (nextValue: string) => void
}

export function useAdsSearchInput(): UseAdsSearchInputResult {
  const queryFromState = useAdsListState(state => state.q)
  const setSearch = useAdsListState(state => state.setSearch)
  const [queryValue, setQueryValueState] = useState(queryFromState)

  useEffect(() => {
    setQueryValueState(currentValue =>
      currentValue === queryFromState ? currentValue : queryFromState
    )
  }, [queryFromState])

  const debouncedSyncQuery = useMemo(() => {
    return debounce((nextValue: string) => {
      setSearch(nextValue)
    }, SEARCH_DEBOUNCE_MS)
  }, [setSearch])

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

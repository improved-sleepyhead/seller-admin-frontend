import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { cancelAdEditPageQueries } from "@/entities/ad/api"

export function useEntryRevision(pathname: string): number {
  const [entryRevision, setEntryRevision] = useState(0)

  useEffect(() => {
    if (!pathname.endsWith("/edit")) {
      return
    }

    setEntryRevision(previousRevision => previousRevision + 1)
  }, [pathname])

  return entryRevision
}

export function useCancelPageQueries(adId: number | null): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (adId === null) {
      return
    }

    return () => {
      void cancelAdEditPageQueries(queryClient, adId)
    }
  }, [adId, queryClient])
}

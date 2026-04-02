import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { cancelAdEditPageQueries } from "@/entities/ad/api"

export function useAdEditEntryRevision(pathname: string): number {
  const [editEntryRevision, setEditEntryRevision] = useState(0)

  useEffect(() => {
    if (!pathname.endsWith("/edit")) {
      return
    }

    setEditEntryRevision(previousRevision => previousRevision + 1)
  }, [pathname])

  return editEntryRevision
}

export function useCancelAdEditPageQueries(adId: number | null): void {
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

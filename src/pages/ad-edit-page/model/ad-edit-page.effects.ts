import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { adsKeys } from "@/entities/ad/api"

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

    const detailQueryKey = adsKeys.editDetail(adId)
    const aiStatusQueryKey = adsKeys.aiStatus()

    return () => {
      void queryClient.cancelQueries({
        exact: true,
        queryKey: detailQueryKey
      })
      void queryClient.cancelQueries({
        exact: true,
        queryKey: aiStatusQueryKey
      })
    }
  }, [adId, queryClient])
}

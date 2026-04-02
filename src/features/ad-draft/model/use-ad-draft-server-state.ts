import { useMemo } from "react"

import type { AdDetailsDto } from "@/entities/ad/api"

import {
  createServerFormSnapshotFromAd,
  createServerHashFromAd
} from "./draft-comparator"

import type { AdDraftServerState } from "./ad-draft.types"

export function useAdDraftServerState(
  ad: AdDetailsDto | null
): AdDraftServerState {
  const serverHash = useMemo(() => {
    if (ad === null) {
      return null
    }

    return createServerHashFromAd(ad)
  }, [ad])

  const serverSnapshot = useMemo(() => {
    if (ad === null) {
      return null
    }

    return createServerFormSnapshotFromAd(ad)
  }, [ad])

  return {
    serverHash,
    serverSnapshot
  }
}

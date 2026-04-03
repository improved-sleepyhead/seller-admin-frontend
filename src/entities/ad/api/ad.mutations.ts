import { mutationOptions } from "@tanstack/react-query"

import { patchAd } from "./ad.api"
import { adsKeys } from "./ad.queries"

import type { ApiSuccessDto, ItemPatchIn } from "./ad.contracts"

export interface UpdateAdMutationVariables {
  item: ItemPatchIn
  signal: AbortSignal
}

export function updateAdMutation(id: number) {
  return mutationOptions({
    mutationFn: ({
      item,
      signal
    }: UpdateAdMutationVariables): Promise<ApiSuccessDto> =>
      patchAd(id, item, signal),
    mutationKey: [...adsKeys.detail(id), "update"] as const
  })
}

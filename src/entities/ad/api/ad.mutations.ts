import { mutationOptions } from "@tanstack/react-query"

import { putAd } from "./ad.api"
import { adsKeys } from "./ad.queries"

import type { ApiSuccessDto, ItemUpdateIn } from "./ad.contracts"

export interface UpdateAdMutationVariables {
  item: ItemUpdateIn
  signal: AbortSignal
}

export function updateAdMutation(id: number) {
  return mutationOptions({
    mutationFn: ({
      item,
      signal
    }: UpdateAdMutationVariables): Promise<ApiSuccessDto> =>
      putAd(id, item, signal),
    mutationKey: [...adsKeys.detail(id), "update"] as const
  })
}

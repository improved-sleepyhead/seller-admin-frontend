import { queryOptions } from "@tanstack/react-query"

import { getAdById, getAdsList, getAiStatus } from "./ad.api"
import { mapToDetailsVM, mapToListItemVM } from "./ad.mapper"

import type {
  AdDetailsDto,
  AdsListQueryParams,
  AiStatusDto
} from "./ad.contracts"
import type { AdDetailsVM, AdsListItemVM } from "./ad.mapper"

const ADS_ROOT_KEY = ["ads"] as const
const DEFAULT_LIMIT = 9
const DEFAULT_SKIP = 0

interface NormalizedAdsListParams {
  q: string
  categories: string
  needsRevision: boolean
  limit: number
  skip: number
  sortColumn: AdsListQueryParams["sortColumn"] | null
  sortDirection: AdsListQueryParams["sortDirection"] | null
}

export interface AdsListQueryData {
  items: AdsListItemVM[]
  total: number
}

function normalizeAdsListParams(
  params: AdsListQueryParams
): NormalizedAdsListParams {
  return {
    categories: [...(params.categories ?? [])].sort().join(","),
    limit: params.limit ?? DEFAULT_LIMIT,
    needsRevision: params.needsRevision ?? false,
    q: params.q ?? "",
    skip: params.skip ?? DEFAULT_SKIP,
    sortColumn: params.sortColumn ?? null,
    sortDirection: params.sortDirection ?? null
  }
}

export const adsKeys = {
  all: ADS_ROOT_KEY,
  lists: () => [...ADS_ROOT_KEY, "list"] as const,
  list: (params: AdsListQueryParams) =>
    [...adsKeys.lists(), normalizeAdsListParams(params)] as const,
  details: () => [...ADS_ROOT_KEY, "detail"] as const,
  detail: (id: number) => [...adsKeys.details(), id] as const,
  editDetail: (id: number) => [...adsKeys.details(), "edit", id] as const,
  ai: () => [...ADS_ROOT_KEY, "ai"] as const,
  aiStatus: () => [...adsKeys.ai(), "status"] as const
}

export function adsListQuery(params: AdsListQueryParams) {
  return queryOptions({
    gcTime: 300_000,
    queryFn: async ({ signal }): Promise<AdsListQueryData> => {
      const result = await getAdsList(params, signal)

      return {
        items: result.items.map(mapToListItemVM),
        total: result.total
      }
    },
    queryKey: adsKeys.list(params),
    staleTime: 30_000
  })
}

export function adDetailQuery(id: number) {
  return queryOptions({
    gcTime: 600_000,
    queryFn: async ({ signal }): Promise<AdDetailsVM> => {
      const result = await getAdById(id, signal)
      return mapToDetailsVM(result)
    },
    queryKey: adsKeys.detail(id),
    staleTime: 60_000
  })
}

export function adEditDetailQuery(id: number) {
  return queryOptions({
    gcTime: 600_000,
    queryFn: ({ signal }): Promise<AdDetailsDto> => getAdById(id, signal),
    queryKey: adsKeys.editDetail(id),
    staleTime: 60_000
  })
}

export function aiStatusQuery() {
  return queryOptions({
    gcTime: 600_000,
    queryFn: ({ signal }): Promise<AiStatusDto> => getAiStatus(signal),
    queryKey: adsKeys.aiStatus(),
    staleTime: 300_000
  })
}

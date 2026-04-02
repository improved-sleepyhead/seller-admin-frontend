import { queryOptions } from "@tanstack/react-query"

import { getAdById, getAdsList, getAiStatus } from "./ad.api"
import { mapToDetailsVM, mapToListItemVM } from "./ad.mapper"

import type {
  AdDetailsDto,
  AdsListQueryParams,
  AiStatusDto
} from "./ad.contracts"
import type { AdDetailsVM, AdsListItemVM } from "./ad.mapper"
import type { QueryClient } from "@tanstack/react-query"

const ADS_ROOT_KEY = ["ads"] as const
const DEFAULT_LIMIT = 9
const DEFAULT_SKIP = 0

// Ads queries intentionally use different freshness windows:
// list data changes often during browsing, detail/edit can stay warm longer,
// and AI availability is effectively session-level config.
export const ADS_QUERY_POLICY = {
  aiStatus: {
    gcTime: 600_000,
    staleTime: 300_000
  },
  detail: {
    gcTime: 600_000,
    staleTime: 60_000
  },
  list: {
    gcTime: 300_000,
    staleTime: 30_000
  }
} as const

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

async function cancelAdsQuery(
  queryClient: QueryClient,
  queryKey: readonly unknown[]
) {
  await queryClient.cancelQueries({
    exact: true,
    queryKey
  })
}

export async function cancelAdsListQuery(
  queryClient: QueryClient,
  params: AdsListQueryParams
) {
  await cancelAdsQuery(queryClient, adsKeys.list(params))
}

export async function cancelAdDetailQuery(
  queryClient: QueryClient,
  id: number
) {
  await cancelAdsQuery(queryClient, adsKeys.detail(id))
}

export async function cancelAdEditPageQueries(
  queryClient: QueryClient,
  id: number
) {
  await Promise.all([
    cancelAdsQuery(queryClient, adsKeys.editDetail(id)),
    cancelAdsQuery(queryClient, adsKeys.aiStatus())
  ])
}

export async function invalidateAdAfterSave(
  queryClient: QueryClient,
  id: number
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adsKeys.detail(id) }),
    queryClient.invalidateQueries({ queryKey: adsKeys.editDetail(id) }),
    queryClient.invalidateQueries({ queryKey: adsKeys.lists() })
  ])
}

export function adsListQuery(params: AdsListQueryParams) {
  return queryOptions({
    gcTime: ADS_QUERY_POLICY.list.gcTime,
    queryFn: async ({ signal }): Promise<AdsListQueryData> => {
      const result = await getAdsList(params, signal)

      return {
        items: result.items.map(mapToListItemVM),
        total: result.total
      }
    },
    queryKey: adsKeys.list(params),
    staleTime: ADS_QUERY_POLICY.list.staleTime
  })
}

export function adDetailQuery(id: number) {
  return queryOptions({
    gcTime: ADS_QUERY_POLICY.detail.gcTime,
    queryFn: async ({ signal }): Promise<AdDetailsVM> => {
      const result = await getAdById(id, signal)
      return mapToDetailsVM(result)
    },
    queryKey: adsKeys.detail(id),
    staleTime: ADS_QUERY_POLICY.detail.staleTime
  })
}

export function adEditDetailQuery(id: number) {
  return queryOptions({
    gcTime: ADS_QUERY_POLICY.detail.gcTime,
    queryFn: ({ signal }): Promise<AdDetailsDto> => getAdById(id, signal),
    queryKey: adsKeys.editDetail(id),
    staleTime: ADS_QUERY_POLICY.detail.staleTime
  })
}

export function aiStatusQuery() {
  return queryOptions({
    gcTime: ADS_QUERY_POLICY.aiStatus.gcTime,
    queryFn: ({ signal }): Promise<AiStatusDto> => getAiStatus(signal),
    queryKey: adsKeys.aiStatus(),
    staleTime: ADS_QUERY_POLICY.aiStatus.staleTime
  })
}

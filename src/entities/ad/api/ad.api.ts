import { apiGet, apiPatch, apiPost } from "shared/api/client"

import { executeApiRequest } from "./ad.request"
import {
  AdDetailsSchema,
  AdListResponseSchema,
  AiDescriptionResponseSchema,
  AiPriceResponseSchema,
  AiStatusSchema,
  SuccessSchema
} from "./ad.schemas"

import type {
  AdDetailsDto,
  AdsListQueryParams,
  AdsListResponseDto,
  AiDescriptionRequest,
  AiDescriptionResponse,
  AiPriceRequest,
  AiPriceResponse,
  AiStatusDto,
  ApiSuccessDto,
  ItemPatchIn,
  ItemUpdateIn
} from "./ad.contracts"

const ADS_LIST_QUERY_PARAM_SETTERS = [
  (searchParams: URLSearchParams, params: AdsListQueryParams) => {
    if (typeof params.q === "string" && params.q.length > 0) {
      searchParams.set("q", params.q)
    }
  },
  (searchParams: URLSearchParams, params: AdsListQueryParams) => {
    if (params.categories && params.categories.length > 0) {
      searchParams.set("categories", params.categories.join(","))
    }
  },
  (searchParams: URLSearchParams, params: AdsListQueryParams) => {
    if (typeof params.needsRevision === "boolean") {
      searchParams.set("needsRevision", params.needsRevision ? "true" : "false")
    }
  },
  (searchParams: URLSearchParams, params: AdsListQueryParams) => {
    if (typeof params.limit === "number") {
      searchParams.set("limit", String(params.limit))
    }
  },
  (searchParams: URLSearchParams, params: AdsListQueryParams) => {
    if (typeof params.skip === "number") {
      searchParams.set("skip", String(params.skip))
    }
  },
  (searchParams: URLSearchParams, params: AdsListQueryParams) => {
    if (params.sortColumn) {
      searchParams.set("sortColumn", params.sortColumn)
    }
  },
  (searchParams: URLSearchParams, params: AdsListQueryParams) => {
    if (params.sortDirection) {
      searchParams.set("sortDirection", params.sortDirection)
    }
  }
] as const satisfies readonly ((
  searchParams: URLSearchParams,
  params: AdsListQueryParams
) => void)[]

function buildAdsListUrl(params: AdsListQueryParams): string {
  const searchParams = new URLSearchParams()

  for (const setQueryParam of ADS_LIST_QUERY_PARAM_SETTERS) {
    setQueryParam(searchParams, params)
  }

  const query = searchParams.toString()

  return query.length > 0 ? `/items?${query}` : "/items"
}

export async function getAdsList(
  params: AdsListQueryParams,
  signal: AbortSignal
): Promise<AdsListResponseDto> {
  return executeApiRequest(
    () => apiGet<unknown>(buildAdsListUrl(params), signal),
    AdListResponseSchema
  )
}

export async function getAdById(
  id: number,
  signal: AbortSignal
): Promise<AdDetailsDto> {
  return executeApiRequest(
    () => apiGet<unknown>(`/items/${id}`, signal),
    AdDetailsSchema
  )
}

export async function patchAd(
  id: number,
  item: ItemPatchIn,
  signal: AbortSignal
): Promise<ApiSuccessDto> {
  return executeApiRequest(
    () => apiPatch<unknown, ItemPatchIn>(`/items/${id}`, item, signal),
    SuccessSchema
  )
}

export async function getAiStatus(signal: AbortSignal): Promise<AiStatusDto> {
  return executeApiRequest(
    () => apiGet<unknown>("/api/ai/status", signal),
    AiStatusSchema
  )
}

export async function requestAiDescription(
  item: ItemUpdateIn,
  signal: AbortSignal
): Promise<AiDescriptionResponse> {
  const body: AiDescriptionRequest = { item }

  return executeApiRequest(
    () =>
      apiPost<unknown, AiDescriptionRequest>(
        "/api/ai/description",
        body,
        signal
      ),
    AiDescriptionResponseSchema
  )
}

export async function requestAiPrice(
  item: ItemUpdateIn,
  signal: AbortSignal
): Promise<AiPriceResponse> {
  const body: AiPriceRequest = { item }

  return executeApiRequest(
    () => apiPost<unknown, AiPriceRequest>("/api/ai/price", body, signal),
    AiPriceResponseSchema
  )
}

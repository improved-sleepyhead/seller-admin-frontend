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

function buildAdsListUrl(params: AdsListQueryParams): string {
  const searchParams = new URLSearchParams()

  if (typeof params.q === "string" && params.q.length > 0) {
    searchParams.set("q", params.q)
  }

  if (params.categories && params.categories.length > 0) {
    searchParams.set("categories", params.categories.join(","))
  }

  if (typeof params.needsRevision === "boolean") {
    searchParams.set("needsRevision", params.needsRevision ? "true" : "false")
  }

  if (typeof params.limit === "number") {
    searchParams.set("limit", String(params.limit))
  }

  if (typeof params.skip === "number") {
    searchParams.set("skip", String(params.skip))
  }

  if (params.sortColumn) {
    searchParams.set("sortColumn", params.sortColumn)
  }

  if (params.sortDirection) {
    searchParams.set("sortDirection", params.sortDirection)
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

import { apiGet, apiPatch, apiPost } from "shared/api/client"
import { normalizeApiError } from "shared/api/error"
import { parseApiResponse } from "shared/api/zod-parser"

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
  try {
    const payload = await apiGet<unknown>(buildAdsListUrl(params), signal)
    return parseApiResponse(AdListResponseSchema, payload)
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function getAdById(
  id: number,
  signal: AbortSignal
): Promise<AdDetailsDto> {
  try {
    const payload = await apiGet<unknown>(`/items/${id}`, signal)
    return parseApiResponse(AdDetailsSchema, payload)
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function patchAd(
  id: number,
  item: ItemPatchIn,
  signal: AbortSignal
): Promise<ApiSuccessDto> {
  try {
    const payload = await apiPatch<unknown, ItemPatchIn>(
      `/items/${id}`,
      item,
      signal
    )
    return parseApiResponse(SuccessSchema, payload)
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function getAiStatus(signal: AbortSignal): Promise<AiStatusDto> {
  try {
    const payload = await apiGet<unknown>("/api/ai/status", signal)
    return parseApiResponse(AiStatusSchema, payload)
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function requestAiDescription(
  item: ItemUpdateIn,
  signal: AbortSignal
): Promise<AiDescriptionResponse> {
  try {
    const body: AiDescriptionRequest = { item }
    const payload = await apiPost<unknown, AiDescriptionRequest>(
      "/api/ai/description",
      body,
      signal
    )

    return parseApiResponse(AiDescriptionResponseSchema, payload)
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function requestAiPrice(
  item: ItemUpdateIn,
  signal: AbortSignal
): Promise<AiPriceResponse> {
  try {
    const body: AiPriceRequest = { item }
    const payload = await apiPost<unknown, AiPriceRequest>(
      "/api/ai/price",
      body,
      signal
    )

    return parseApiResponse(AiPriceResponseSchema, payload)
  } catch (error) {
    throw normalizeApiError(error)
  }
}

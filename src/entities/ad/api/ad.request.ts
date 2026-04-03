import { apiGet, apiPatch, apiPost } from "@/shared/api/client"
import { normalizeApiError } from "@/shared/api/error"
import { parseApiResponse } from "@/shared/api/zod-parser"

import type { ZodType } from "zod/v4"

interface RequestOptions<TData> {
  request: () => Promise<unknown>
  schema: ZodType<TData>
}

interface ReadRequestOptions<TData> {
  schema: ZodType<TData>
  signal: AbortSignal
  url: string
}

interface WriteRequestOptions<TData, TBody> extends ReadRequestOptions<TData> {
  body: TBody
}

async function executeApiRequest<TData>({
  request,
  schema
}: RequestOptions<TData>): Promise<TData> {
  try {
    const payload = await request()
    return parseApiResponse(schema, payload)
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export function getParsedResponse<TData>({
  schema,
  signal,
  url
}: ReadRequestOptions<TData>): Promise<TData> {
  return executeApiRequest({
    request: () => apiGet<unknown>(url, signal),
    schema
  })
}

export function postParsedResponse<TData, TBody>({
  body,
  schema,
  signal,
  url
}: WriteRequestOptions<TData, TBody>): Promise<TData> {
  return executeApiRequest({
    request: () => apiPost<unknown, TBody>(url, body, signal),
    schema
  })
}

export function patchParsedResponse<TData, TBody>({
  body,
  schema,
  signal,
  url
}: WriteRequestOptions<TData, TBody>): Promise<TData> {
  return executeApiRequest({
    request: () => apiPatch<unknown, TBody>(url, body, signal),
    schema
  })
}

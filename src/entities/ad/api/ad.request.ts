import { normalizeApiError } from "@/shared/api/error"
import { parseApiResponse } from "@/shared/api/zod-parser"

import type { ZodType } from "zod/v4"

export async function executeApiRequest<TData>(
  request: () => Promise<unknown>,
  schema: ZodType<TData>
): Promise<TData> {
  try {
    const payload = await request()
    return parseApiResponse(schema, payload)
  } catch (error) {
    throw normalizeApiError(error)
  }
}

import { z } from "zod/v4"

import type { AppApiError, AppApiFieldErrors } from "./error"

export type ApiParseResult<TData> =
  | {
      success: true
      data: TData
    }
  | {
      success: false
      error: AppApiError
    }

function getFieldErrors(error: z.ZodError): AppApiFieldErrors | undefined {
  const flattened = z.flattenError(error)
  const normalized: AppApiFieldErrors = {}

  for (const [field, fieldErrors] of Object.entries(flattened.fieldErrors)) {
    if (!fieldErrors || fieldErrors.length === 0) {
      continue
    }

    normalized[field] = fieldErrors
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined
}

export function safeParseApiResponse<TData>(
  schema: z.ZodType<TData>,
  payload: unknown,
  message = "Response validation failed."
): ApiParseResult<TData> {
  const result = schema.safeParse(payload)

  if (result.success) {
    return {
      data: result.data,
      success: true
    }
  }

  return {
    error: {
      code: "VALIDATION_ERROR",
      fieldErrors: getFieldErrors(result.error),
      message,
      raw: payload,
      status: null
    },
    success: false
  }
}

export function parseApiResponse<TData>(
  schema: z.ZodType<TData>,
  payload: unknown,
  message?: string
): TData {
  const result = safeParseApiResponse(schema, payload, message)

  if (!result.success) {
    throw result.error
  }

  return result.data
}

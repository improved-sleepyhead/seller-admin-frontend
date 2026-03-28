import { z } from "zod/v4"

import { AppApiError, type AppApiErrorCode } from "@/shared/api/error"

import type { AiChatStreamErrorPayload } from "./ai-chat.transport.types"

export const BackendErrorSchema = z.object({
  code: z.string().optional(),
  details: z.unknown().optional(),
  message: z.string().optional(),
  success: z.literal(false)
})

const BACKEND_CODE_TO_APP_CODE: Record<string, AppApiErrorCode> = {
  AI_PROVIDER_ERROR: "AI_STREAM_ERROR",
  AI_STREAM_ERROR: "AI_STREAM_ERROR",
  AI_TIMEOUT: "AI_TIMEOUT",
  AI_UNAVAILABLE: "AI_UNAVAILABLE",
  BAD_REQUEST: "BAD_REQUEST",
  NETWORK_ERROR: "NETWORK_ERROR",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR"
}

function mapAppErrorCode(
  rawCode: string | undefined,
  status: number | null
): AppApiErrorCode {
  if (rawCode) {
    const mappedCode = BACKEND_CODE_TO_APP_CODE[rawCode]

    if (mappedCode) {
      return mappedCode
    }
  }

  if (status === 404) {
    return "NOT_FOUND"
  }

  if (status === 408) {
    return "AI_TIMEOUT"
  }

  return "BAD_REQUEST"
}

export function toAppApiError(
  errorPayload: Omit<AiChatStreamErrorPayload, "success">,
  status: number | null,
  fallbackCode: AppApiErrorCode,
  fallbackMessage: string
): AppApiError {
  const code = mapAppErrorCode(errorPayload.code, status)

  return new AppApiError({
    code: errorPayload.code ? code : fallbackCode,
    message: errorPayload.message ?? fallbackMessage,
    raw: errorPayload.details,
    status
  })
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError"
}

export function createStreamEndedError(): AppApiError {
  return new AppApiError({
    code: "AI_STREAM_ERROR",
    message: "AI stream ended before done event.",
    status: null
  })
}

export async function parseErrorResponse(
  response: Response
): Promise<AppApiError> {
  const status = response.status

  try {
    const payload: unknown = await response.json()
    const parsedPayload = BackendErrorSchema.safeParse(payload)

    if (parsedPayload.success) {
      return toAppApiError(
        parsedPayload.data,
        status,
        "BAD_REQUEST",
        "AI chat request failed."
      )
    }
  } catch {
    // Fallback handled below.
  }

  return new AppApiError({
    code: mapAppErrorCode(undefined, status),
    message: "AI chat request failed.",
    status
  })
}

export function toNetworkAppApiError(error: unknown): AppApiError {
  return new AppApiError({
    code: "NETWORK_ERROR",
    message:
      error instanceof Error && error.message.length > 0
        ? error.message
        : "Network request failed.",
    raw: error,
    status: null
  })
}

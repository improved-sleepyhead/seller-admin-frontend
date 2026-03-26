import { isAxiosError } from "axios"

export const APP_API_ERROR_CODES = [
  "BAD_REQUEST",
  "NOT_FOUND",
  "VALIDATION_ERROR",
  "NETWORK_ERROR",
  "AI_UNAVAILABLE",
  "AI_TIMEOUT",
  "AI_STREAM_ERROR"
] as const

export type AppApiErrorCode = (typeof APP_API_ERROR_CODES)[number]

export type AppApiFieldErrors = Record<string, string[]>

export type AppApiError = {
  status: number | null
  code: AppApiErrorCode
  message: string
  fieldErrors?: AppApiFieldErrors
  raw?: unknown
}

type BackendApiErrorPayload = {
  code?: string
  message?: string
  details?: unknown
}

const backendCodeMap: Record<string, AppApiErrorCode> = {
  AI_PROVIDER_ERROR: "AI_STREAM_ERROR",
  AI_STREAM_ERROR: "AI_STREAM_ERROR",
  AI_TIMEOUT: "AI_TIMEOUT",
  AI_UNAVAILABLE: "AI_UNAVAILABLE",
  BAD_REQUEST: "BAD_REQUEST",
  NETWORK_ERROR: "NETWORK_ERROR",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isAppApiErrorCode(value: unknown): value is AppApiErrorCode {
  return typeof value === "string" && APP_API_ERROR_CODES.includes(value as AppApiErrorCode)
}

function getDefaultMessage(code: AppApiErrorCode): string {
  switch (code) {
    case "AI_STREAM_ERROR":
      return "AI stream failed."
    case "AI_TIMEOUT":
      return "AI request timed out."
    case "AI_UNAVAILABLE":
      return "AI features are currently unavailable."
    case "NETWORK_ERROR":
      return "Network request failed."
    case "NOT_FOUND":
      return "Requested resource was not found."
    case "VALIDATION_ERROR":
      return "Request validation failed."
    case "BAD_REQUEST":
    default:
      return "Request failed."
  }
}

function getCodeFromStatus(status: number | null): AppApiErrorCode {
  if (status === 404) {
    return "NOT_FOUND"
  }

  if (status === 408) {
    return "AI_TIMEOUT"
  }

  return "BAD_REQUEST"
}

function extractBackendPayload(data: unknown): BackendApiErrorPayload | undefined {
  if (!isRecord(data)) {
    return undefined
  }

  return {
    code: typeof data.code === "string" ? data.code : undefined,
    details: data.details,
    message: typeof data.message === "string" ? data.message : undefined
  }
}

function extractFieldErrorsFromValidationDetails(details: unknown): AppApiFieldErrors | undefined {
  if (!isRecord(details)) {
    return undefined
  }

  const properties = details.properties

  if (!isRecord(properties)) {
    return undefined
  }

  const normalized: AppApiFieldErrors = {}

  for (const [field, fieldValue] of Object.entries(properties)) {
    if (!isRecord(fieldValue) || !Array.isArray(fieldValue.errors)) {
      continue
    }

    const messages = fieldValue.errors.filter(
      (entry): entry is string => typeof entry === "string" && entry.length > 0
    )

    if (messages.length > 0) {
      normalized[field] = messages
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined
}

function toAppApiErrorCode(rawCode: string | undefined, status: number | null): AppApiErrorCode {
  if (rawCode && backendCodeMap[rawCode]) {
    return backendCodeMap[rawCode]
  }

  return getCodeFromStatus(status)
}

export function isAppApiError(value: unknown): value is AppApiError {
  if (!isRecord(value)) {
    return false
  }

  return (
    (typeof value.status === "number" || value.status === null) &&
    isAppApiErrorCode(value.code) &&
    typeof value.message === "string"
  )
}

export function normalizeApiError(error: unknown): AppApiError {
  if (isAppApiError(error)) {
    return error
  }

  if (isAxiosError(error)) {
    if (!error.response) {
      const code: AppApiErrorCode = error.code === "ECONNABORTED" ? "AI_TIMEOUT" : "NETWORK_ERROR"

      return {
        code,
        message: error.message || getDefaultMessage(code),
        raw: error,
        status: null
      }
    }

    const payload = extractBackendPayload(error.response.data)
    const status = error.response.status ?? null
    const code = toAppApiErrorCode(payload?.code, status)

    return {
      code,
      fieldErrors: extractFieldErrorsFromValidationDetails(payload?.details),
      message: payload?.message ?? error.message ?? getDefaultMessage(code),
      raw: error.response.data,
      status
    }
  }

  if (error instanceof Error) {
    return {
      code: "BAD_REQUEST",
      message: error.message || getDefaultMessage("BAD_REQUEST"),
      raw: error,
      status: null
    }
  }

  return {
    code: "BAD_REQUEST",
    message: getDefaultMessage("BAD_REQUEST"),
    raw: error,
    status: null
  }
}

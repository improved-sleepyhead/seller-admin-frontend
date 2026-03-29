import { z } from "zod/v4"

const DEFAULT_API_BASE_URL = "http://localhost:8080"

const apiBaseUrlSchema = z.url()

interface RuntimeWindow {
  APP_CONFIG?: {
    API_BASE_URL?: unknown
  }
}

function readRawApiBaseUrl(): unknown {
  const runtimeWindow = globalThis as typeof globalThis &
    RuntimeWindow & {
      window?: RuntimeWindow
    }

  return (
    runtimeWindow.window?.APP_CONFIG?.API_BASE_URL ??
    runtimeWindow.APP_CONFIG?.API_BASE_URL
  )
}

export function getApiBaseUrl(): string {
  const rawApiBaseUrl = readRawApiBaseUrl()

  if (typeof rawApiBaseUrl !== "string" || rawApiBaseUrl.trim() === "") {
    return DEFAULT_API_BASE_URL
  }

  const parsedApiBaseUrl = apiBaseUrlSchema.safeParse(rawApiBaseUrl)

  if (!parsedApiBaseUrl.success) {
    const formatted = z.prettifyError(parsedApiBaseUrl.error)
    throw new Error(`Invalid window.APP_CONFIG.API_BASE_URL:\n${formatted}`)
  }

  return parsedApiBaseUrl.data
}

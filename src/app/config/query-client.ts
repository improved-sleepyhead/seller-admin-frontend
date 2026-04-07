import {
  QueryClient,
  type DefaultOptions,
  type QueryClientConfig
} from "@tanstack/react-query"

export const APP_QUERY_CLIENT_CACHE_POLICY = {
  persistence: "memory-only",
  resetOnFullRefresh: true
} as const

export const DEFAULT_QUERY_OPTIONS = {
  queries: {
    refetchOnWindowFocus: false,
    retry: 1
  }
} as const satisfies DefaultOptions

export const APP_QUERY_CLIENT_CONFIG = {
  defaultOptions: DEFAULT_QUERY_OPTIONS
} as const satisfies QueryClientConfig

export function createQueryClient() {
  return new QueryClient(APP_QUERY_CLIENT_CONFIG)
}

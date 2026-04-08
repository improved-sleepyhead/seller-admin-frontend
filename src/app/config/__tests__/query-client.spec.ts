import { describe, expect, it } from "vitest"

import {
  APP_QUERY_CLIENT_CACHE_POLICY,
  APP_QUERY_CLIENT_CONFIG,
  DEFAULT_QUERY_OPTIONS,
  createQueryClient
} from "../query-client"

describe("query client policy", () => {
  it("should keep app-level query defaults centralized", () => {
    const queryClient = createQueryClient()

    expect(DEFAULT_QUERY_OPTIONS).toEqual({
      queries: {
        refetchOnWindowFocus: false,
        retry: 1
      }
    })
    expect(APP_QUERY_CLIENT_CONFIG).toEqual({
      defaultOptions: DEFAULT_QUERY_OPTIONS
    })
    expect(queryClient.getDefaultOptions()).toMatchObject(DEFAULT_QUERY_OPTIONS)
  })

  it("should document memory-only cache behavior", () => {
    expect(APP_QUERY_CLIENT_CACHE_POLICY).toEqual({
      persistence: "memory-only",
      resetOnFullRefresh: true
    })
  })
})

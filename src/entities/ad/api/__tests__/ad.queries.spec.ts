import { QueryClient } from "@tanstack/react-query"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  ADS_QUERY_POLICY,
  adDetailQuery,
  adEditDetailQuery,
  adsKeys,
  adsListQuery,
  aiStatusQuery,
  cancelAdDetailQuery,
  cancelAdEditPageQueries,
  cancelAdsListQuery,
  invalidateAdAfterSave
} from "../ad.queries"

import type { AdsListQueryParams } from "../ad.contracts"

describe("ad query options", () => {
  it("should keep list/detail/ai cache policy centralized", () => {
    expect(adsListQuery({})).toMatchObject({
      gcTime: ADS_QUERY_POLICY.list.gcTime,
      queryKey: adsKeys.list({}),
      staleTime: ADS_QUERY_POLICY.list.staleTime
    })

    expect(adDetailQuery(7)).toMatchObject({
      gcTime: ADS_QUERY_POLICY.detail.gcTime,
      queryKey: adsKeys.detail(7),
      staleTime: ADS_QUERY_POLICY.detail.staleTime
    })

    expect(adEditDetailQuery(7)).toMatchObject({
      gcTime: ADS_QUERY_POLICY.detail.gcTime,
      queryKey: adsKeys.editDetail(7),
      staleTime: ADS_QUERY_POLICY.detail.staleTime
    })

    expect(aiStatusQuery()).toMatchObject({
      gcTime: ADS_QUERY_POLICY.aiStatus.gcTime,
      queryKey: adsKeys.aiStatus(),
      staleTime: ADS_QUERY_POLICY.aiStatus.staleTime
    })
  })
})

describe("ad query helpers", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
  })

  it("should cancel the exact list query for current params", async () => {
    const cancelQueries = vi
      .spyOn(queryClient, "cancelQueries")
      .mockResolvedValue(undefined)
    const params: AdsListQueryParams = {
      categories: ["auto"],
      limit: 9,
      needsRevision: true,
      q: "mitsubishi",
      skip: 9,
      sortColumn: "price" as const,
      sortDirection: "asc" as const
    }

    await cancelAdsListQuery(queryClient, params)

    expect(cancelQueries).toHaveBeenCalledWith({
      exact: true,
      queryKey: adsKeys.list(params)
    })
  })

  it("should cancel detail and ai status together for edit page cleanup", async () => {
    const cancelQueries = vi
      .spyOn(queryClient, "cancelQueries")
      .mockResolvedValue(undefined)

    await cancelAdDetailQuery(queryClient, 5)
    await cancelAdEditPageQueries(queryClient, 5)

    expect(cancelQueries).toHaveBeenNthCalledWith(1, {
      exact: true,
      queryKey: adsKeys.detail(5)
    })
    expect(cancelQueries).toHaveBeenNthCalledWith(2, {
      exact: true,
      queryKey: adsKeys.editDetail(5)
    })
    expect(cancelQueries).toHaveBeenNthCalledWith(3, {
      exact: true,
      queryKey: adsKeys.aiStatus()
    })
  })

  it("should invalidate detail, edit detail and all list queries after save", async () => {
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined)

    await invalidateAdAfterSave(queryClient, 11)

    expect(invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: adsKeys.detail(11)
    })
    expect(invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: adsKeys.editDetail(11)
    })
    expect(invalidateQueries).toHaveBeenNthCalledWith(3, {
      queryKey: adsKeys.lists()
    })
  })
})

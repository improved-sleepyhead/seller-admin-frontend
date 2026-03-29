import { describe, expect, it } from "vitest"

import {
  ADS_LIST_DEFAULT_URL_PARAMS,
  mapAdsUrlParamsToBackendQuery,
  parseAdsSearchParams
} from "../ad.search-params"

describe("parseAdsSearchParams", () => {
  it("should return defaults for empty params", () => {
    const result = parseAdsSearchParams(new URLSearchParams())

    expect(result).toEqual(ADS_LIST_DEFAULT_URL_PARAMS)
  })

  it("should normalize negative page to 1", () => {
    const result = parseAdsSearchParams(new URLSearchParams("page=-5"))

    expect(result.page).toBe(1)
  })

  it("should normalize invalid sortColumn to createdAt", () => {
    const result = parseAdsSearchParams(
      new URLSearchParams("sortColumn=unsupported")
    )

    expect(result.sortColumn).toBe("createdAt")
  })

  it("should keep only known categories", () => {
    const result = parseAdsSearchParams(
      new URLSearchParams("categories=auto,invalid,electronics")
    )

    expect(result.categories).toEqual(["auto", "electronics"])
  })
})

describe("mapAdsUrlParamsToBackendQuery", () => {
  it("should map page 2 to skip 10 and limit 10", () => {
    const query = mapAdsUrlParamsToBackendQuery({
      ...ADS_LIST_DEFAULT_URL_PARAMS,
      page: 2
    })

    expect(query).toMatchObject({
      limit: 10,
      skip: 10
    })
  })

  it("should omit optional backend fields for empty values", () => {
    const query = mapAdsUrlParamsToBackendQuery(ADS_LIST_DEFAULT_URL_PARAMS)

    expect(query).toEqual({
      q: undefined,
      categories: undefined,
      needsRevision: undefined,
      sortColumn: "createdAt",
      sortDirection: "desc",
      limit: 10,
      skip: 0
    })
  })
})

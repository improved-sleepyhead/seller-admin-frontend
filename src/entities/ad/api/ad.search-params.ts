import {
  AD_CATEGORIES,
  AD_SORT_COLUMNS,
  AD_SORT_DIRECTIONS,
  type AdCategory,
  type AdsListQueryParams,
  type AdSortColumn,
  type AdSortDirection
} from "./ad.contracts"

export const ADS_LAYOUTS = ["grid", "list"] as const
export const ADS_LIST_PAGE_SIZE = 10
const DEFAULT_PAGE = 1

export type AdsLayout = (typeof ADS_LAYOUTS)[number]

export interface AdsListUrlParams {
  q: string
  categories: AdCategory[]
  needsRevision: boolean
  sortColumn: AdSortColumn
  sortDirection: AdSortDirection
  page: number
  layout: AdsLayout
}

export interface AdsListBackendQueryParams {
  q?: string
  categories?: string
  needsRevision?: "true"
  sortColumn: AdSortColumn
  sortDirection: AdSortDirection
  limit: number
  skip: number
}

export const ADS_LIST_DEFAULT_URL_PARAMS: AdsListUrlParams = {
  q: "",
  categories: [],
  needsRevision: false,
  sortColumn: "createdAt",
  sortDirection: "desc",
  page: DEFAULT_PAGE,
  layout: "grid"
}

function isAdCategory(value: string): value is AdCategory {
  return AD_CATEGORIES.includes(value as AdCategory)
}

function isAdSortColumn(value: string): value is AdSortColumn {
  return AD_SORT_COLUMNS.includes(value as AdSortColumn)
}

function isAdSortDirection(value: string): value is AdSortDirection {
  return AD_SORT_DIRECTIONS.includes(value as AdSortDirection)
}

function isAdsLayout(value: string): value is AdsLayout {
  return ADS_LAYOUTS.includes(value as AdsLayout)
}

function parseCategories(rawCategories: string | null): AdCategory[] {
  if (!rawCategories) {
    return []
  }

  const normalizedCategories: AdCategory[] = []

  for (const chunk of rawCategories.split(",")) {
    const category = chunk.trim()

    if (
      category.length > 0 &&
      isAdCategory(category) &&
      !normalizedCategories.includes(category)
    ) {
      normalizedCategories.push(category)
    }
  }

  return normalizedCategories
}

function parsePage(pageValue: string | null): number {
  if (!pageValue) {
    return DEFAULT_PAGE
  }

  const parsedPage = Number.parseInt(pageValue, 10)

  if (!Number.isInteger(parsedPage) || parsedPage < DEFAULT_PAGE) {
    return DEFAULT_PAGE
  }

  return parsedPage
}

export function parseAdsSearchParams(
  searchParams: URLSearchParams
): AdsListUrlParams {
  const q = searchParams.get("q")?.trim() ?? ""
  const categories = parseCategories(searchParams.get("categories"))
  const needsRevision = searchParams.get("needsRevision") === "true"

  const sortColumnParam = searchParams.get("sortColumn")
  const sortDirectionParam = searchParams.get("sortDirection")
  const layoutParam = searchParams.get("layout")

  return {
    q,
    categories,
    needsRevision,
    sortColumn:
      sortColumnParam && isAdSortColumn(sortColumnParam)
        ? sortColumnParam
        : ADS_LIST_DEFAULT_URL_PARAMS.sortColumn,
    sortDirection:
      sortDirectionParam && isAdSortDirection(sortDirectionParam)
        ? sortDirectionParam
        : ADS_LIST_DEFAULT_URL_PARAMS.sortDirection,
    page: parsePage(searchParams.get("page")),
    layout:
      layoutParam && isAdsLayout(layoutParam)
        ? layoutParam
        : ADS_LIST_DEFAULT_URL_PARAMS.layout
  }
}

export function createAdsSearchParams(
  params: AdsListUrlParams
): URLSearchParams {
  const searchParams = new URLSearchParams()
  const q = params.q.trim()

  if (q.length > 0) {
    searchParams.set("q", q)
  }

  if (params.categories.length > 0) {
    searchParams.set("categories", params.categories.join(","))
  }

  if (params.needsRevision) {
    searchParams.set("needsRevision", "true")
  }

  if (params.sortColumn !== ADS_LIST_DEFAULT_URL_PARAMS.sortColumn) {
    searchParams.set("sortColumn", params.sortColumn)
  }

  if (params.sortDirection !== ADS_LIST_DEFAULT_URL_PARAMS.sortDirection) {
    searchParams.set("sortDirection", params.sortDirection)
  }

  if (params.page !== ADS_LIST_DEFAULT_URL_PARAMS.page) {
    searchParams.set("page", String(params.page))
  }

  if (params.layout !== ADS_LIST_DEFAULT_URL_PARAMS.layout) {
    searchParams.set("layout", params.layout)
  }

  return searchParams
}

export function mapAdsUrlParamsToBackendQuery(
  params: AdsListUrlParams
): AdsListBackendQueryParams {
  const q = params.q.trim()

  return {
    q: q.length > 0 ? q : undefined,
    categories:
      params.categories.length > 0 ? params.categories.join(",") : undefined,
    needsRevision: params.needsRevision ? "true" : undefined,
    sortColumn: params.sortColumn,
    sortDirection: params.sortDirection,
    limit: ADS_LIST_PAGE_SIZE,
    skip: (params.page - 1) * ADS_LIST_PAGE_SIZE
  }
}

export function mapAdsUrlParamsToListQuery(
  params: AdsListUrlParams
): AdsListQueryParams {
  return {
    q: params.q,
    categories: [...params.categories],
    needsRevision: params.needsRevision,
    sortColumn: params.sortColumn,
    sortDirection: params.sortDirection,
    limit: ADS_LIST_PAGE_SIZE,
    skip: (params.page - 1) * ADS_LIST_PAGE_SIZE
  }
}

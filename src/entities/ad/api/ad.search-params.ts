import {
  AD_CATEGORIES,
  AD_SORT_COLUMNS,
  AD_SORT_DIRECTIONS,
  type AdCategory,
  type AdsListQueryParams,
  type AdSortColumn,
  type AdSortDirection
} from "./ad.contracts"

const ADS_LAYOUTS = ["grid", "list"] as const
const ADS_PAGE_SIZE = 10
const DEFAULT_PAGE = 1

type AdsLayout = (typeof ADS_LAYOUTS)[number]

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
        : "createdAt",
    sortDirection:
      sortDirectionParam && isAdSortDirection(sortDirectionParam)
        ? sortDirectionParam
        : "desc",
    page: parsePage(searchParams.get("page")),
    layout: layoutParam && isAdsLayout(layoutParam) ? layoutParam : "grid"
  }
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
    limit: ADS_PAGE_SIZE,
    skip: (params.page - 1) * ADS_PAGE_SIZE
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
    limit: ADS_PAGE_SIZE,
    skip: (params.page - 1) * ADS_PAGE_SIZE
  }
}

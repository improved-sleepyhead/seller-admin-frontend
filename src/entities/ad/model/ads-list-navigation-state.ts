/* eslint-disable import/no-internal-modules */
import {
  serializeAdsListUrlParams,
  type AdsListUrlParams
} from "../api/ad.search-params"
/* eslint-enable import/no-internal-modules */

const ADS_LIST_PATH = "/ads"

export interface AdsListNavigationState {
  adsSearch: string
}

export function createAdsListNavigationState(
  params: AdsListUrlParams
): AdsListNavigationState {
  const serializedSearch = serializeAdsListUrlParams(params)

  return {
    adsSearch: serializedSearch.length > 0 ? `?${serializedSearch}` : ""
  }
}

export function resolveAdsSearchFromNavigationState(
  state: unknown
): string | null {
  if (
    typeof state !== "object" ||
    state === null ||
    !("adsSearch" in state) ||
    typeof state.adsSearch !== "string"
  ) {
    return null
  }

  const normalizedSearch = state.adsSearch.trim()

  if (normalizedSearch.length === 0) {
    return ""
  }

  if (!normalizedSearch.startsWith("?")) {
    return null
  }

  return normalizedSearch
}

export function buildAdsListHrefFromNavigationState(state: unknown): string {
  const adsSearch = resolveAdsSearchFromNavigationState(state)

  if (adsSearch === null || adsSearch.length === 0) {
    return ADS_LIST_PATH
  }

  return `${ADS_LIST_PATH}${adsSearch}`
}

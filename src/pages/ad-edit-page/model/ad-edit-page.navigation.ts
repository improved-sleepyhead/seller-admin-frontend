import { getAdsSearch, type AdsListNavigationState } from "@/entities/ad-list"

export function parseAdId(rawId: string | undefined): number | null {
  if (!rawId) {
    return null
  }

  const parsedId = Number(rawId)

  if (!Number.isInteger(parsedId) || parsedId < 1) {
    return null
  }

  return parsedId
}

export function resolveNavigationState(
  state: unknown
): AdsListNavigationState | undefined {
  const adsSearch = getAdsSearch(state)

  if (adsSearch === null) {
    return undefined
  }

  return { adsSearch }
}

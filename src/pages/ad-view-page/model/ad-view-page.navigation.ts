import {
  getAdsListHref,
  getAdsSearch,
  type AdsListNavigationState
} from "@/entities/ad-list"

export function parseAdId(rawId: string | undefined): number | null {
  if (!rawId) {
    return null
  }

  const adId = Number(rawId)

  if (!Number.isInteger(adId) || adId < 1) {
    return null
  }

  return adId
}

export function buildEditHref(adId: number): string {
  return `/ads/${adId}/edit`
}

export function resolveNavigation(locationState: unknown): {
  backHref: string
  editState?: AdsListNavigationState
} {
  const backHref = getAdsListHref(locationState)
  const adsSearch = getAdsSearch(locationState)

  return {
    backHref,
    editState: adsSearch === null ? undefined : { adsSearch }
  }
}

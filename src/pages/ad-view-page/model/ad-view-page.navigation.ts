import {
  getAdsListHref,
  getAdsSearch,
  type AdsListNavigationState
} from "@/entities/ad/model"

export function parseAdViewPageId(rawId: string | undefined): number | null {
  if (!rawId) {
    return null
  }

  const adId = Number(rawId)

  if (!Number.isInteger(adId) || adId < 1) {
    return null
  }

  return adId
}

export function buildAdEditHref(adId: number): string {
  return `/ads/${adId}/edit`
}

export function resolveAdViewNavigationState(locationState: unknown): {
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

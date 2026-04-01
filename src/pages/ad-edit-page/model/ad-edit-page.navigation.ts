import {
  resolveAdsSearchFromNavigationState,
  type AdsListNavigationState
} from "@/entities/ad/model"

export function parseAdEditPageId(rawId: string | undefined): number | null {
  if (!rawId) {
    return null
  }

  const parsedId = Number(rawId)

  if (!Number.isInteger(parsedId) || parsedId < 1) {
    return null
  }

  return parsedId
}

export function resolveAdEditNavigationState(
  state: unknown
): AdsListNavigationState | undefined {
  const adsSearch = resolveAdsSearchFromNavigationState(state)

  if (adsSearch === null) {
    return undefined
  }

  return { adsSearch }
}

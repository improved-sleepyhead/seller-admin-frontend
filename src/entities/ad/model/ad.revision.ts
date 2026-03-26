import {
  AD_CORE_FIELD_LABELS,
  AD_PARAM_LABELS_BY_CATEGORY,
  AD_REQUIRED_PARAM_KEYS_BY_CATEGORY
} from "./ad.constants"

import type { Ad } from "./ad.types"

function isEmptyValue(value: unknown): boolean {
  if (value === null || typeof value === "undefined") {
    return true
  }

  if (typeof value === "number") {
    return Number.isNaN(value)
  }

  if (typeof value === "string") {
    return value.trim().length === 0
  }

  return false
}

function getParamValue(ad: Ad, key: string): unknown {
  return (ad.params as Record<string, unknown>)[key]
}

export function getMissingFields(ad: Ad): string[] {
  const missingFields: string[] = []

  if (isEmptyValue(ad.description)) {
    missingFields.push(AD_CORE_FIELD_LABELS.description)
  }

  const requiredParamKeys = AD_REQUIRED_PARAM_KEYS_BY_CATEGORY[ad.category]
  const paramLabelsByKey = AD_PARAM_LABELS_BY_CATEGORY[ad.category] as Record<
    string,
    string
  >

  for (const key of requiredParamKeys) {
    if (isEmptyValue(getParamValue(ad, key))) {
      missingFields.push(paramLabelsByKey[key] ?? key)
    }
  }

  return missingFields
}

export function doesNeedRevision(ad: Ad): boolean {
  return getMissingFields(ad).length > 0
}

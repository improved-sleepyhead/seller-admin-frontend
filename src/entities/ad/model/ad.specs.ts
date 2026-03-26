import {
  AD_PARAM_LABELS_BY_CATEGORY,
  AD_REQUIRED_PARAM_KEYS_BY_CATEGORY,
  AUTO_TRANSMISSION_LABELS,
  ELECTRONICS_CONDITION_LABELS,
  ELECTRONICS_TYPE_LABELS,
  REAL_ESTATE_TYPE_LABELS
} from "./ad.constants"

import type { Ad, FilledSpec } from "./ad.types"

const ENUM_LABELS_BY_CATEGORY: Record<
  string,
  Record<string, Record<string, string>>
> = {
  auto: {
    transmission: AUTO_TRANSMISSION_LABELS
  },
  electronics: {
    condition: ELECTRONICS_CONDITION_LABELS,
    type: ELECTRONICS_TYPE_LABELS
  },
  real_estate: {
    type: REAL_ESTATE_TYPE_LABELS
  }
}

function isFilledValue(value: unknown): boolean {
  if (value === null || typeof value === "undefined") {
    return false
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
  }

  if (typeof value === "string") {
    return value.trim().length > 0
  }

  return true
}

function formatSpecValue(ad: Ad, key: string, value: unknown): string | null {
  if (!isFilledValue(value)) {
    return null
  }

  if (typeof value === "number") {
    return String(value)
  }

  if (typeof value === "string") {
    const enumLabels = ENUM_LABELS_BY_CATEGORY[ad.category]?.[key]
    return enumLabels?.[value] ?? value.trim()
  }

  return String(value)
}

export function getFilledSpecs(ad: Ad): FilledSpec[] {
  const specs: FilledSpec[] = []
  const paramLabelsByKey = AD_PARAM_LABELS_BY_CATEGORY[ad.category] as Record<
    string,
    string
  >
  const specKeys = AD_REQUIRED_PARAM_KEYS_BY_CATEGORY[ad.category]
  const params = ad.params as Record<string, unknown>

  for (const key of specKeys) {
    const formattedValue = formatSpecValue(ad, key, params[key])

    if (!formattedValue) {
      continue
    }

    specs.push({
      label: paramLabelsByKey[key] ?? key,
      value: formattedValue
    })
  }

  return specs
}

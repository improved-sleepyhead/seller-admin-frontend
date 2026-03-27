import type { AdDetailsDto, AdEditFormValues } from "@/entities/ad"

const NUMERIC_PARAM_KEYS = new Set([
  "area",
  "enginePower",
  "floor",
  "mileage",
  "yearOfManufacture"
])

const CATEGORY_PARAM_KEY_ORDER: Record<AdEditFormValues["category"], string[]> = {
  auto: [
    "brand",
    "model",
    "yearOfManufacture",
    "transmission",
    "mileage",
    "enginePower"
  ],
  electronics: ["type", "brand", "model", "condition", "color"],
  real_estate: ["type", "address", "area", "floor"]
}

function normalizeNumericValue(
  value: string | number | undefined
): string | number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined
  }

  if (typeof value !== "string") {
    return undefined
  }

  const trimmedValue = value.trim()

  if (trimmedValue.length === 0) {
    return ""
  }

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : trimmedValue
}

function normalizePrice(
  value: AdEditFormValues["price"]
): AdEditFormValues["price"] {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : ""
  }

  const trimmedValue = value.trim()

  if (trimmedValue.length === 0) {
    return ""
  }

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : trimmedValue
}

function normalizeParams(
  category: AdEditFormValues["category"],
  params: AdEditFormValues["params"]
): AdEditFormValues["params"] {
  const orderedKnownKeys = CATEGORY_PARAM_KEY_ORDER[category]
  const knownKeysSet = new Set(orderedKnownKeys)
  const extraKeys = Object.keys(params)
    .filter(key => !knownKeysSet.has(key))
    .sort()
  const orderedKeys = [...orderedKnownKeys, ...extraKeys]
  const normalizedParams: AdEditFormValues["params"] = {}

  for (const key of orderedKeys) {
    const rawValue = params[key]
    normalizedParams[key] = NUMERIC_PARAM_KEYS.has(key)
      ? normalizeNumericValue(rawValue)
      : rawValue
  }

  return normalizedParams
}

function normalizeDraftFormValues(values: AdEditFormValues): AdEditFormValues {
  return {
    category: values.category,
    description: values.description,
    params: normalizeParams(values.category, values.params),
    price: normalizePrice(values.price),
    title: values.title
  }
}

function toComparableSnapshot(values: AdEditFormValues): string {
  return JSON.stringify(normalizeDraftFormValues(values))
}

export function createServerHashFromAd(ad: AdDetailsDto): string {
  return `${ad.id}:${ad.updatedAt}`
}

export function areDraftFormsEqual(
  left: AdEditFormValues,
  right: AdEditFormValues
): boolean {
  return toComparableSnapshot(left) === toComparableSnapshot(right)
}

export function isDraftDifferentFromServer(
  draftForm: AdEditFormValues,
  serverForm: AdEditFormValues
): boolean {
  return !areDraftFormsEqual(draftForm, serverForm)
}

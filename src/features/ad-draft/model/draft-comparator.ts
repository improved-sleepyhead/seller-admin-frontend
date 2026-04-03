import type { AdDetailsDto } from "@/entities/ad/api"
import type { AdEditFormValues } from "@/entities/ad/model"

const NUMERIC_PARAM_KEYS = new Set([
  "area",
  "enginePower",
  "floor",
  "mileage",
  "yearOfManufacture"
])

const CATEGORY_PARAM_KEY_ORDER: Record<AdEditFormValues["category"], string[]> =
  {
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

function toTextValue(value: string | undefined): string {
  return value ?? ""
}

function toNumericValue(value: number | undefined): number | string {
  return value ?? ""
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

export function getServerHash(ad: AdDetailsDto): string {
  return `${ad.id}:${ad.updatedAt}`
}

const SERVER_FORM_SNAPSHOT_BUILDERS = {
  auto: (
    ad: Extract<AdDetailsDto, { category: "auto" }>
  ): AdEditFormValues => ({
    category: ad.category,
    description: ad.description ?? "",
    params: {
      brand: toTextValue(ad.params.brand),
      enginePower: toNumericValue(ad.params.enginePower),
      mileage: toNumericValue(ad.params.mileage),
      model: toTextValue(ad.params.model),
      transmission: toTextValue(ad.params.transmission),
      yearOfManufacture: toNumericValue(ad.params.yearOfManufacture)
    },
    price: ad.price,
    title: ad.title
  }),
  electronics: (
    ad: Extract<AdDetailsDto, { category: "electronics" }>
  ): AdEditFormValues => ({
    category: ad.category,
    description: ad.description ?? "",
    params: {
      brand: toTextValue(ad.params.brand),
      color: toTextValue(ad.params.color),
      condition: toTextValue(ad.params.condition),
      model: toTextValue(ad.params.model),
      type: toTextValue(ad.params.type)
    },
    price: ad.price,
    title: ad.title
  }),
  real_estate: (
    ad: Extract<AdDetailsDto, { category: "real_estate" }>
  ): AdEditFormValues => ({
    category: ad.category,
    description: ad.description ?? "",
    params: {
      address: toTextValue(ad.params.address),
      area: toNumericValue(ad.params.area),
      floor: toNumericValue(ad.params.floor),
      type: toTextValue(ad.params.type)
    },
    price: ad.price,
    title: ad.title
  })
} satisfies {
  [Category in AdDetailsDto["category"]]: (
    ad: Extract<AdDetailsDto, { category: Category }>
  ) => AdEditFormValues
}

function buildServerFormSnapshotForAd<
  Category extends AdDetailsDto["category"]
>(ad: Extract<AdDetailsDto, { category: Category }>): AdEditFormValues {
  const buildServerFormSnapshot = SERVER_FORM_SNAPSHOT_BUILDERS[
    ad.category
  ] as (ad: Extract<AdDetailsDto, { category: Category }>) => AdEditFormValues

  return buildServerFormSnapshot(ad)
}

export function toServerForm(ad: AdDetailsDto): AdEditFormValues {
  return buildServerFormSnapshotForAd(ad)
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

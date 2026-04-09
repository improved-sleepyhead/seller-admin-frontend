import { ItemUpdateInSchema } from "../api"

import type { AdDetailsDto, ItemPatchIn, ItemUpdateIn } from "../api"
import type { AdEditFormValues } from "./ad.types"

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

function toTextFormValue(value: string | undefined): string {
  return value ?? ""
}

function toNumericFormValue(value: number | undefined): number | string {
  return value ?? ""
}

function toTrimmedString(value: unknown): string {
  if (typeof value === "string") {
    return value.trim()
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  return ""
}

function toOptionalTrimmedString(value: unknown): string | undefined {
  const trimmedValue = toTrimmedString(value)
  return trimmedValue.length > 0 ? trimmedValue : undefined
}

function toStrictNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : Number.NaN
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim()

    if (trimmedValue.length === 0) {
      return Number.NaN
    }

    const parsedValue = Number(trimmedValue)
    return Number.isFinite(parsedValue) ? parsedValue : Number.NaN
  }

  return Number.NaN
}

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim()

    if (trimmedValue.length === 0) {
      return 0
    }

    const parsedValue = Number(trimmedValue)
    return Number.isFinite(parsedValue) ? parsedValue : 0
  }

  return 0
}

function toPositiveNumber(value: unknown): number | undefined {
  const parsedValue = toNumber(value)
  return parsedValue > 0 ? parsedValue : undefined
}

function toOptionalEnumValue<const TValue extends string>(
  value: unknown,
  allowedValues: readonly TValue[]
): TValue | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  return allowedValues.includes(value as TValue) ? (value as TValue) : undefined
}

function toOptionalDescription(value: string): string | undefined {
  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : undefined
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
  const knownKeys = new Set(orderedKnownKeys)
  const extraKeys = Object.keys(params)
    .filter(key => !knownKeys.has(key))
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

const FORM_VALUE_BUILDERS = {
  auto: (
    ad: Extract<AdDetailsDto, { category: "auto" }>
  ): AdEditFormValues => ({
    category: ad.category,
    description: ad.description ?? "",
    params: {
      brand: toTextFormValue(ad.params.brand),
      enginePower: toNumericFormValue(ad.params.enginePower),
      mileage: toNumericFormValue(ad.params.mileage),
      model: toTextFormValue(ad.params.model),
      transmission: toTextFormValue(ad.params.transmission),
      yearOfManufacture: toNumericFormValue(ad.params.yearOfManufacture)
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
      brand: toTextFormValue(ad.params.brand),
      color: toTextFormValue(ad.params.color),
      condition: toTextFormValue(ad.params.condition),
      model: toTextFormValue(ad.params.model),
      type: toTextFormValue(ad.params.type)
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
      address: toTextFormValue(ad.params.address),
      area: toNumericFormValue(ad.params.area),
      floor: toNumericFormValue(ad.params.floor),
      type: toTextFormValue(ad.params.type)
    },
    price: ad.price,
    title: ad.title
  })
} satisfies {
  [Category in AdDetailsDto["category"]]: (
    ad: Extract<AdDetailsDto, { category: Category }>
  ) => AdEditFormValues
}

interface ItemUpdateBaseCandidate {
  description?: string
  price: number
  title: string
}

type ItemPatchBaseCandidate = Pick<
  ItemPatchIn,
  "description" | "price" | "title"
>

const ITEM_UPDATE_BUILDERS = {
  auto: (
    values: AdEditFormValues,
    basePayload: ItemUpdateBaseCandidate
  ): ItemUpdateIn => ({
    ...basePayload,
    category: "auto",
    params: {
      brand: toTrimmedString(values.params.brand),
      enginePower: toStrictNumber(values.params.enginePower),
      mileage: toStrictNumber(values.params.mileage),
      model: toTrimmedString(values.params.model),
      transmission: toTrimmedString(values.params.transmission) as
        | "automatic"
        | "manual",
      yearOfManufacture: toStrictNumber(values.params.yearOfManufacture)
    }
  }),
  electronics: (
    values: AdEditFormValues,
    basePayload: ItemUpdateBaseCandidate
  ): ItemUpdateIn => ({
    ...basePayload,
    category: "electronics",
    params: {
      brand: toTrimmedString(values.params.brand),
      color: toTrimmedString(values.params.color),
      condition: toTrimmedString(values.params.condition) as "new" | "used",
      model: toTrimmedString(values.params.model),
      type: toTrimmedString(values.params.type) as "phone" | "laptop" | "misc"
    }
  }),
  real_estate: (
    values: AdEditFormValues,
    basePayload: ItemUpdateBaseCandidate
  ): ItemUpdateIn => ({
    ...basePayload,
    category: "real_estate",
    params: {
      address: toTrimmedString(values.params.address),
      area: toStrictNumber(values.params.area),
      floor: toStrictNumber(values.params.floor),
      type: toTrimmedString(values.params.type) as "flat" | "house" | "room"
    }
  })
}

const AUTO_TRANSMISSION_VALUES = ["automatic", "manual"] as const
const ELECTRONICS_CONDITION_VALUES = ["new", "used"] as const
const ELECTRONICS_TYPE_VALUES = ["phone", "laptop", "misc"] as const
const REAL_ESTATE_TYPE_VALUES = ["flat", "house", "room"] as const

const ITEM_PATCH_BUILDERS = {
  auto: (
    values: AdEditFormValues,
    basePayload: ItemPatchBaseCandidate
  ): Extract<ItemPatchIn, { category: "auto" }> => ({
    ...basePayload,
    category: "auto",
    params: {
      brand: toOptionalTrimmedString(values.params.brand),
      enginePower: toPositiveNumber(values.params.enginePower),
      mileage: toPositiveNumber(values.params.mileage),
      model: toOptionalTrimmedString(values.params.model),
      transmission: toOptionalEnumValue(
        values.params.transmission,
        AUTO_TRANSMISSION_VALUES
      ),
      yearOfManufacture: toPositiveNumber(values.params.yearOfManufacture)
    }
  }),
  electronics: (
    values: AdEditFormValues,
    basePayload: ItemPatchBaseCandidate
  ): Extract<ItemPatchIn, { category: "electronics" }> => ({
    ...basePayload,
    category: "electronics",
    params: {
      brand: toOptionalTrimmedString(values.params.brand),
      color: toOptionalTrimmedString(values.params.color),
      condition: toOptionalEnumValue(
        values.params.condition,
        ELECTRONICS_CONDITION_VALUES
      ),
      model: toOptionalTrimmedString(values.params.model),
      type: toOptionalEnumValue(values.params.type, ELECTRONICS_TYPE_VALUES)
    }
  }),
  real_estate: (
    values: AdEditFormValues,
    basePayload: ItemPatchBaseCandidate
  ): Extract<ItemPatchIn, { category: "real_estate" }> => ({
    ...basePayload,
    category: "real_estate",
    params: {
      address: toOptionalTrimmedString(values.params.address),
      area: toPositiveNumber(values.params.area),
      floor: toPositiveNumber(values.params.floor),
      type: toOptionalEnumValue(values.params.type, REAL_ESTATE_TYPE_VALUES)
    }
  })
} satisfies {
  [Category in AdEditFormValues["category"]]: (
    values: AdEditFormValues,
    basePayload: ItemPatchBaseCandidate
  ) => Extract<ItemPatchIn, { category: Category }>
}

function buildItemUpdateCandidate(values: AdEditFormValues): ItemUpdateIn {
  const basePayload = {
    description: toOptionalDescription(values.description),
    price: toStrictNumber(values.price),
    title: values.title.trim()
  }

  return ITEM_UPDATE_BUILDERS[values.category](values, basePayload)
}

function buildItemPatchCandidate(values: AdEditFormValues): ItemPatchIn {
  const basePayload = {
    description: values.description.trim(),
    price: toNumber(values.price),
    title: values.title.trim()
  }

  return ITEM_PATCH_BUILDERS[values.category](values, basePayload)
}

function buildFormValuesForAd<Category extends AdDetailsDto["category"]>(
  ad: Extract<AdDetailsDto, { category: Category }>
): AdEditFormValues {
  const buildFormValues = FORM_VALUE_BUILDERS[ad.category] as (
    value: Extract<AdDetailsDto, { category: Category }>
  ) => AdEditFormValues

  return buildFormValues(ad)
}

export function toAdEditFormValues(ad: AdDetailsDto): AdEditFormValues {
  return buildFormValuesForAd(ad)
}

export function safeParseItemUpdate(values: AdEditFormValues) {
  return ItemUpdateInSchema.safeParse(buildItemUpdateCandidate(values))
}

export function toItemUpdate(values: AdEditFormValues): ItemUpdateIn {
  return ItemUpdateInSchema.parse(buildItemUpdateCandidate(values))
}

export function toItemPatch(values: AdEditFormValues): ItemPatchIn {
  return buildItemPatchCandidate(values)
}

export function normalizeAdEditFormValues(
  values: AdEditFormValues
): AdEditFormValues {
  return {
    category: values.category,
    description: values.description,
    params: normalizeParams(values.category, values.params),
    price: normalizePrice(values.price),
    title: values.title
  }
}

export function areAdEditFormValuesEqual(
  left: AdEditFormValues,
  right: AdEditFormValues
): boolean {
  return (
    JSON.stringify(normalizeAdEditFormValues(left)) ===
    JSON.stringify(normalizeAdEditFormValues(right))
  )
}

export function getAdServerHash(ad: AdDetailsDto): string {
  return `${ad.id}:${ad.updatedAt}`
}

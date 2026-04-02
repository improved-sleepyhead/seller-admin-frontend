import type {
  AutoAdParamsWrite,
  ItemPatchIn,
  RealEstateAdParamsWrite,
  ElectronicsAdParamsWrite
} from "@/entities/ad/api"
import type { AdEditFormValues } from "@/entities/ad/model"

const AUTO_TRANSMISSION_VALUES = ["automatic", "manual"] as const
const REAL_ESTATE_TYPE_VALUES = ["flat", "house", "room"] as const
const ELECTRONICS_TYPE_VALUES = ["phone", "laptop", "misc"] as const
const ELECTRONICS_CONDITION_VALUES = ["new", "used"] as const

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

function mapAutoParams(
  values: AdEditFormValues["params"]
): Partial<AutoAdParamsWrite> {
  return {
    brand: toOptionalTrimmedString(values.brand),
    model: toOptionalTrimmedString(values.model),
    yearOfManufacture: toPositiveNumber(values.yearOfManufacture),
    transmission: toOptionalEnumValue(
      values.transmission,
      AUTO_TRANSMISSION_VALUES
    ),
    mileage: toPositiveNumber(values.mileage),
    enginePower: toPositiveNumber(values.enginePower)
  }
}

function mapRealEstateParams(
  values: AdEditFormValues["params"]
): Partial<RealEstateAdParamsWrite> {
  return {
    type: toOptionalEnumValue(values.type, REAL_ESTATE_TYPE_VALUES),
    address: toOptionalTrimmedString(values.address),
    area: toPositiveNumber(values.area),
    floor: toPositiveNumber(values.floor)
  }
}

function mapElectronicsParams(
  values: AdEditFormValues["params"]
): Partial<ElectronicsAdParamsWrite> {
  return {
    type: toOptionalEnumValue(values.type, ELECTRONICS_TYPE_VALUES),
    brand: toOptionalTrimmedString(values.brand),
    model: toOptionalTrimmedString(values.model),
    condition: toOptionalEnumValue(
      values.condition,
      ELECTRONICS_CONDITION_VALUES
    ),
    color: toOptionalTrimmedString(values.color)
  }
}

type AdSaveBasePayload = Pick<ItemPatchIn, "description" | "price" | "title">

const AD_SAVE_PAYLOAD_BUILDERS = {
  auto: (
    values: AdEditFormValues,
    basePayload: AdSaveBasePayload
  ): Extract<ItemPatchIn, { category: "auto" }> => ({
    category: "auto",
    ...basePayload,
    params: mapAutoParams(values.params)
  }),
  electronics: (
    values: AdEditFormValues,
    basePayload: AdSaveBasePayload
  ): Extract<ItemPatchIn, { category: "electronics" }> => ({
    category: "electronics",
    ...basePayload,
    params: mapElectronicsParams(values.params)
  }),
  real_estate: (
    values: AdEditFormValues,
    basePayload: AdSaveBasePayload
  ): Extract<ItemPatchIn, { category: "real_estate" }> => ({
    category: "real_estate",
    ...basePayload,
    params: mapRealEstateParams(values.params)
  })
} satisfies {
  [Category in AdEditFormValues["category"]]: (
    values: AdEditFormValues,
    basePayload: AdSaveBasePayload
  ) => Extract<ItemPatchIn, { category: Category }>
}

export function toItemPatch(values: AdEditFormValues): ItemPatchIn {
  const basePayload = {
    description: values.description.trim(),
    title: values.title.trim(),
    price: toNumber(values.price)
  }

  return AD_SAVE_PAYLOAD_BUILDERS[values.category](values, basePayload)
}

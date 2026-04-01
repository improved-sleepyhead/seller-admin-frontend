import type {
  ItemUpdateIn,
  AutoAdParamsWrite,
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

function toEnumValue<const TValue extends string>(
  value: unknown,
  allowedValues: readonly TValue[],
  fallbackValue: TValue
): TValue {
  if (typeof value !== "string") {
    return fallbackValue
  }

  return allowedValues.includes(value as TValue)
    ? (value as TValue)
    : fallbackValue
}

function mapAutoParams(values: AdEditFormValues["params"]): AutoAdParamsWrite {
  return {
    brand: toTrimmedString(values.brand),
    model: toTrimmedString(values.model),
    yearOfManufacture: toNumber(values.yearOfManufacture),
    transmission: toEnumValue(
      values.transmission,
      AUTO_TRANSMISSION_VALUES,
      "automatic"
    ),
    mileage: toNumber(values.mileage),
    enginePower: toNumber(values.enginePower)
  }
}

function mapRealEstateParams(
  values: AdEditFormValues["params"]
): RealEstateAdParamsWrite {
  return {
    type: toEnumValue(values.type, REAL_ESTATE_TYPE_VALUES, "flat"),
    address: toTrimmedString(values.address),
    area: toNumber(values.area),
    floor: toNumber(values.floor)
  }
}

function mapElectronicsParams(
  values: AdEditFormValues["params"]
): ElectronicsAdParamsWrite {
  return {
    type: toEnumValue(values.type, ELECTRONICS_TYPE_VALUES, "phone"),
    brand: toTrimmedString(values.brand),
    model: toTrimmedString(values.model),
    condition: toEnumValue(
      values.condition,
      ELECTRONICS_CONDITION_VALUES,
      "new"
    ),
    color: toTrimmedString(values.color)
  }
}

export function mapAdEditFormValuesToItemUpdateIn(
  values: AdEditFormValues
): ItemUpdateIn {
  const description = values.description.trim()
  const basePayload = {
    title: values.title.trim(),
    description: description.length > 0 ? description : undefined,
    price: toNumber(values.price)
  }

  if (values.category === "auto") {
    return {
      ...basePayload,
      category: "auto",
      params: mapAutoParams(values.params)
    }
  }

  if (values.category === "real_estate") {
    return {
      ...basePayload,
      category: "real_estate",
      params: mapRealEstateParams(values.params)
    }
  }

  return {
    ...basePayload,
    category: "electronics",
    params: mapElectronicsParams(values.params)
  }
}

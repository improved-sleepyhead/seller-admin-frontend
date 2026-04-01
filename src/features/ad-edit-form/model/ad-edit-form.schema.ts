import { z } from "zod/v4"

import type { AdEditFormValues } from "@/entities/ad/model"

const TRANSMISSION_VALUES = ["automatic", "manual"] as const
const REAL_ESTATE_TYPE_VALUES = ["flat", "house", "room"] as const
const ELECTRONICS_TYPE_VALUES = ["phone", "laptop", "misc"] as const
const ELECTRONICS_CONDITION_VALUES = ["new", "used"] as const

const REQUIRED_STRING_ERROR = "Поле обязательно"
const POSITIVE_NUMBER_ERROR = "Введите число больше 0"

const PositiveNumberSchema = z.union([z.number(), z.string()]).refine(value => {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0
  }

  const trimmedValue = value.trim()

  if (trimmedValue.length === 0) {
    return false
  }

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) && parsedValue > 0
}, POSITIVE_NUMBER_ERROR)

const RequiredStringSchema = z.string().refine(value => value.trim().length > 0, {
  message: REQUIRED_STRING_ERROR
})

function createEnumValueSchema<const TValue extends string>(
  allowedValues: readonly TValue[]
) {
  return z.string().refine(
    value =>
      typeof value === "string" && allowedValues.includes(value as TValue),
    {
      message: REQUIRED_STRING_ERROR
    }
  )
}

const BaseFormSchema = z.object({
  description: z.string().max(1000, "Максимум 1000 символов"),
  price: PositiveNumberSchema,
  title: z.string().refine(value => value.trim().length > 0, {
    message: "Введите заголовок"
  })
})

const AutoFormSchema = BaseFormSchema.extend({
  category: z.literal("auto"),
  params: z.object({
    brand: RequiredStringSchema,
    enginePower: PositiveNumberSchema,
    mileage: PositiveNumberSchema,
    model: RequiredStringSchema,
    transmission: createEnumValueSchema(TRANSMISSION_VALUES),
    yearOfManufacture: PositiveNumberSchema
  })
})

const RealEstateFormSchema = BaseFormSchema.extend({
  category: z.literal("real_estate"),
  params: z.object({
    address: RequiredStringSchema,
    area: PositiveNumberSchema,
    floor: PositiveNumberSchema,
    type: createEnumValueSchema(REAL_ESTATE_TYPE_VALUES)
  })
})

const ElectronicsFormSchema = BaseFormSchema.extend({
  category: z.literal("electronics"),
  params: z.object({
    brand: RequiredStringSchema,
    color: RequiredStringSchema,
    condition: createEnumValueSchema(ELECTRONICS_CONDITION_VALUES),
    model: RequiredStringSchema,
    type: createEnumValueSchema(ELECTRONICS_TYPE_VALUES)
  })
})

export const AdEditFormSchema = z.discriminatedUnion("category", [
  AutoFormSchema,
  RealEstateFormSchema,
  ElectronicsFormSchema
]) satisfies z.ZodType<AdEditFormValues>

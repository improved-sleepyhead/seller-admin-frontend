import { z } from "zod/v4"

import { AD_CATEGORIES, type AdEditFormValues } from "@/entities/ad"

const PriceSchema = z.union([z.number(), z.string()]).refine(value => {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0
  }

  const trimmedValue = value.trim()

  if (trimmedValue.length === 0) {
    return false
  }

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) && parsedValue > 0
}, "число должно быть > 0")

const ParamsSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.undefined()])
)

export const AdEditFormSchema = z.object({
  category: z.enum(AD_CATEGORIES),
  description: z.string().max(1000, "Максимум 1000 символов"),
  params: ParamsSchema,
  price: PriceSchema,
  title: z.string().refine(value => value.trim().length > 0, {
    message: "Введите заголовок"
  })
}) satisfies z.ZodType<AdEditFormValues>

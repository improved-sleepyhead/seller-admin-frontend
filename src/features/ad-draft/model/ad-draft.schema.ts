import { z } from "zod/v4"

import { AD_CATEGORIES, type AdDraft, type AdEditFormValues } from "@/entities/ad"

const DraftFormParamsSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.undefined()])
)

const DraftFormSchema: z.ZodType<AdEditFormValues> = z.object({
  category: z.enum(AD_CATEGORIES),
  description: z.string(),
  params: DraftFormParamsSchema,
  price: z.union([z.string(), z.number()]),
  title: z.string()
})

export const AdDraftSchema: z.ZodType<AdDraft> = z.object({
  form: DraftFormSchema,
  itemId: z.number().int().positive(),
  savedAt: z.string().datetime(),
  serverHash: z.string().min(1)
})

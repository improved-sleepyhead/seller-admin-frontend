import { z } from "zod/v4"

import {
  AD_CATEGORIES,
  AD_SORT_COLUMNS,
  AD_SORT_DIRECTIONS,
  type AdCategory,
  type AdDetailsDto,
  type AdListItemDto,
  type AdsListQueryParams,
  type AdsListResponseDto,
  type AiDescriptionResponse,
  type AiPriceResponse,
  type AiStatusDto,
  type ApiSuccessDto,
  type ItemUpdateIn
} from "./ad.contracts"

const AdCategorySchema = z.enum(AD_CATEGORIES)
const AdSortColumnSchema = z.enum(AD_SORT_COLUMNS)
const AdSortDirectionSchema = z.enum(AD_SORT_DIRECTIONS)

const AdReadBaseSchema = z.object({
  createdAt: z.string().min(1),
  description: z.string().optional(),
  id: z.number(),
  images: z.array(z.string().url()).optional(),
  needsRevision: z.boolean().optional(),
  previewImage: z.string().url().optional(),
  price: z.number(),
  title: z.string().min(1),
  updatedAt: z.string().min(1)
})

const AutoParamsDtoSchema = z.object({
  brand: z.string().optional(),
  enginePower: z.number().optional(),
  mileage: z.number().optional(),
  model: z.string().optional(),
  transmission: z.enum(["automatic", "manual"]).optional(),
  yearOfManufacture: z.number().optional()
})

const RealEstateParamsDtoSchema = z.object({
  address: z.string().optional(),
  area: z.number().optional(),
  floor: z.number().optional(),
  type: z.enum(["flat", "house", "room"]).optional()
})

const ElectronicsParamsDtoSchema = z.object({
  brand: z.string().optional(),
  color: z.string().optional(),
  condition: z.enum(["new", "used"]).optional(),
  model: z.string().optional(),
  type: z.enum(["phone", "laptop", "misc"]).optional()
})

export const AdListItemSchema: z.ZodType<AdListItemDto> = z.discriminatedUnion(
  "category",
  [
    AdReadBaseSchema.extend({
      category: z.literal("auto"),
      params: AutoParamsDtoSchema
    }),
    AdReadBaseSchema.extend({
      category: z.literal("real_estate"),
      params: RealEstateParamsDtoSchema
    }),
    AdReadBaseSchema.extend({
      category: z.literal("electronics"),
      params: ElectronicsParamsDtoSchema
    })
  ]
)

export const AdDetailsSchema: z.ZodType<AdDetailsDto> = AdListItemSchema

export const AdListResponseSchema: z.ZodType<AdsListResponseDto> = z.object({
  items: z.array(AdListItemSchema),
  total: z.number().int().nonnegative()
})

const ItemUpdateBaseSchema = z.object({
  description: z.string().optional(),
  price: z.number(),
  title: z.string().min(1)
})

const AutoParamsInSchema = z.object({
  brand: z.string().min(1),
  enginePower: z.number(),
  mileage: z.number(),
  model: z.string().min(1),
  transmission: z.enum(["automatic", "manual"]),
  yearOfManufacture: z.number()
})

const RealEstateParamsInSchema = z.object({
  address: z.string().min(1),
  area: z.number(),
  floor: z.number(),
  type: z.enum(["flat", "house", "room"])
})

const ElectronicsParamsInSchema = z.object({
  brand: z.string().min(1),
  color: z.string().min(1),
  condition: z.enum(["new", "used"]),
  model: z.string().min(1),
  type: z.enum(["phone", "laptop", "misc"])
})

export const ItemUpdateInSchema: z.ZodType<ItemUpdateIn> = z.discriminatedUnion(
  "category",
  [
    ItemUpdateBaseSchema.extend({
      category: z.literal("auto"),
      params: AutoParamsInSchema
    }),
    ItemUpdateBaseSchema.extend({
      category: z.literal("real_estate"),
      params: RealEstateParamsInSchema
    }),
    ItemUpdateBaseSchema.extend({
      category: z.literal("electronics"),
      params: ElectronicsParamsInSchema
    })
  ]
)

export const SuccessSchema: z.ZodType<ApiSuccessDto> = z.object({
  success: z.literal(true)
})

export const AiUsageSchema = z.object({
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  totalTokens: z.number().optional()
})

export const AiStatusSchema: z.ZodType<AiStatusDto> = z.object({
  enabled: z.boolean(),
  features: z.object({
    chat: z.boolean(),
    description: z.boolean(),
    price: z.boolean()
  }),
  model: z.string().nullable(),
  provider: z.enum(["openrouter"]).nullable()
})

export const AiDescriptionResponseSchema: z.ZodType<AiDescriptionResponse> =
  z.object({
    model: z.string().optional(),
    suggestion: z.string().min(1),
    usage: AiUsageSchema.optional()
  })

export const AiPriceResponseSchema: z.ZodType<AiPriceResponse> = z.object({
  currency: z.literal("RUB"),
  model: z.string().optional(),
  reasoning: z.string().min(1),
  suggestedPrice: z.number(),
  usage: AiUsageSchema.optional()
})

export const AdCategoryFilterSchema: z.ZodType<AdCategory> = AdCategorySchema

export const AdsListQueryParamsSchema: z.ZodType<AdsListQueryParams> = z.object(
  {
    categories: z.array(AdCategorySchema).optional(),
    limit: z.number().int().positive().optional(),
    needsRevision: z.boolean().optional(),
    q: z.string().optional(),
    skip: z.number().int().nonnegative().optional(),
    sortColumn: AdSortColumnSchema.optional(),
    sortDirection: AdSortDirectionSchema.optional()
  }
)

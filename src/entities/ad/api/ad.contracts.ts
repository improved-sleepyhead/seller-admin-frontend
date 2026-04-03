export const AD_CATEGORIES = ["auto", "real_estate", "electronics"] as const

export type AdCategory = (typeof AD_CATEGORIES)[number]

export const AD_SORT_COLUMNS = ["title", "createdAt", "price"] as const

export type AdSortColumn = (typeof AD_SORT_COLUMNS)[number]

export const AD_SORT_DIRECTIONS = ["asc", "desc"] as const

export type AdSortDirection = (typeof AD_SORT_DIRECTIONS)[number]

export interface AdReadBaseDto {
  id: number
  title: string
  description?: string
  price: number
  createdAt: string
  updatedAt: string
  previewImage?: string
  images?: string[]
  needsRevision?: boolean
}

export interface AutoParamsDto {
  brand?: string
  model?: string
  yearOfManufacture?: number
  transmission?: "automatic" | "manual"
  mileage?: number
  enginePower?: number
}

export interface RealEstateParamsDto {
  type?: "flat" | "house" | "room"
  address?: string
  area?: number
  floor?: number
}

export interface ElectronicsParamsDto {
  type?: "phone" | "laptop" | "misc"
  brand?: string
  model?: string
  condition?: "new" | "used"
  color?: string
}

export interface AutoAdListItemDto extends AdReadBaseDto {
  category: "auto"
  params: AutoParamsDto
}

export interface RealEstateAdListItemDto extends AdReadBaseDto {
  category: "real_estate"
  params: RealEstateParamsDto
}

export interface ElectronicsAdListItemDto extends AdReadBaseDto {
  category: "electronics"
  params: ElectronicsParamsDto
}

export type AdListItemDto =
  | AutoAdListItemDto
  | RealEstateAdListItemDto
  | ElectronicsAdListItemDto

export type AdDetailsDto = AdListItemDto

export interface AdsListResponseDto {
  items: AdListItemDto[]
  total: number
}

export interface ItemUpdateBase {
  title: string
  description?: string
  price: number
}

export interface AutoParamsIn {
  brand: string
  model: string
  yearOfManufacture: number
  transmission: "automatic" | "manual"
  mileage: number
  enginePower: number
}

export interface RealEstateParamsIn {
  type: "flat" | "house" | "room"
  address: string
  area: number
  floor: number
}

export interface ElectronicsParamsIn {
  type: "phone" | "laptop" | "misc"
  brand: string
  model: string
  condition: "new" | "used"
  color: string
}

export interface AutoItemIn extends ItemUpdateBase {
  category: "auto"
  params: AutoParamsIn
}

export interface RealEstateItemIn extends ItemUpdateBase {
  category: "real_estate"
  params: RealEstateParamsIn
}

export interface ElectronicsItemIn extends ItemUpdateBase {
  category: "electronics"
  params: ElectronicsParamsIn
}

export type ItemUpdateIn = AutoItemIn | RealEstateItemIn | ElectronicsItemIn

export interface ItemPatchBase {
  category: AdCategory
  title?: string
  description?: string
  price?: number
}

export interface AutoItemPatchIn extends ItemPatchBase {
  category: "auto"
  params?: Partial<AutoParamsIn>
}

export interface RealEstateItemPatchIn extends ItemPatchBase {
  category: "real_estate"
  params?: Partial<RealEstateParamsIn>
}

export interface ElectronicsItemPatchIn extends ItemPatchBase {
  category: "electronics"
  params?: Partial<ElectronicsParamsIn>
}

export type ItemPatchIn =
  | AutoItemPatchIn
  | RealEstateItemPatchIn
  | ElectronicsItemPatchIn

export interface ApiSuccessDto {
  success: true
}

export interface AiUsageDto {
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
}

export interface AiStatusDto {
  enabled: boolean
  provider: "openrouter" | null
  model: string | null
  features: {
    description: boolean
    price: boolean
    chat: boolean
  }
}

export interface AiDescriptionResponse {
  suggestion: string
  model?: string
  usage?: AiUsageDto
}

export interface AiPriceResponse {
  suggestedPrice: number
  reasoning: string
  currency: "RUB"
  model?: string
  usage?: AiUsageDto
}

export interface AiChatRequest {
  item: ItemUpdateIn
  messages: {
    role: "user" | "assistant"
    content: string
  }[]
  userMessage: string
}

export interface AiDescriptionRequest {
  item: ItemUpdateIn
}

export interface AiPriceRequest {
  item: ItemUpdateIn
}

export interface AdsListQueryParams {
  q?: string
  categories?: AdCategory[]
  needsRevision?: boolean
  limit?: number
  skip?: number
  sortColumn?: AdSortColumn
  sortDirection?: AdSortDirection
}

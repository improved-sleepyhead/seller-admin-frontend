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

export interface AutoAdParamsRead {
  brand?: string
  model?: string
  yearOfManufacture?: number
  transmission?: "automatic" | "manual"
  mileage?: number
  enginePower?: number
}

export interface RealEstateAdParamsRead {
  type?: "flat" | "house" | "room"
  address?: string
  area?: number
  floor?: number
}

export interface ElectronicsAdParamsRead {
  type?: "phone" | "laptop" | "misc"
  brand?: string
  model?: string
  condition?: "new" | "used"
  color?: string
}

export interface AutoAdListItemDto extends AdReadBaseDto {
  category: "auto"
  params: AutoAdParamsRead
}

export interface RealEstateAdListItemDto extends AdReadBaseDto {
  category: "real_estate"
  params: RealEstateAdParamsRead
}

export interface ElectronicsAdListItemDto extends AdReadBaseDto {
  category: "electronics"
  params: ElectronicsAdParamsRead
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

export interface AutoAdParamsWrite {
  brand: string
  model: string
  yearOfManufacture: number
  transmission: "automatic" | "manual"
  mileage: number
  enginePower: number
}

export interface RealEstateAdParamsWrite {
  type: "flat" | "house" | "room"
  address: string
  area: number
  floor: number
}

export interface ElectronicsAdParamsWrite {
  type: "phone" | "laptop" | "misc"
  brand: string
  model: string
  condition: "new" | "used"
  color: string
}

export interface AutoItemUpdateIn extends ItemUpdateBase {
  category: "auto"
  params: AutoAdParamsWrite
}

export interface RealEstateItemUpdateIn extends ItemUpdateBase {
  category: "real_estate"
  params: RealEstateAdParamsWrite
}

export interface ElectronicsItemUpdateIn extends ItemUpdateBase {
  category: "electronics"
  params: ElectronicsAdParamsWrite
}

export type ItemUpdateIn =
  | AutoItemUpdateIn
  | RealEstateItemUpdateIn
  | ElectronicsItemUpdateIn

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

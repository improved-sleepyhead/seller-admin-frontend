export type AdCategory = "auto" | "real_estate" | "electronics"

export interface AutoParams {
  brand?: string
  model?: string
  yearOfManufacture?: number
  transmission?: "automatic" | "manual"
  mileage?: number
  enginePower?: number
}

export interface RealEstateParams {
  type?: "flat" | "house" | "room"
  address?: string
  area?: number
  floor?: number
}

export interface ElectronicsParams {
  type?: "phone" | "laptop" | "misc"
  brand?: string
  model?: string
  condition?: "new" | "used"
  color?: string
}

interface AdBase {
  id: number
  category: AdCategory
  title: string
  description?: string
  price: number
  createdAt: string
  updatedAt: string
  previewImage?: string | null
  images?: string[]
  needsRevision?: boolean
}

export interface AutoAd extends AdBase {
  category: "auto"
  params: AutoParams
}

export interface RealEstateAd extends AdBase {
  category: "real_estate"
  params: RealEstateParams
}

export interface ElectronicsAd extends AdBase {
  category: "electronics"
  params: ElectronicsParams
}

export type Ad = AutoAd | RealEstateAd | ElectronicsAd

export interface AdEditFormValues {
  category: AdCategory
  title: string
  price: number | string
  description: string
  params: Record<string, string | number | undefined>
}

export interface AdDraft {
  itemId: number
  form: AdEditFormValues
  savedAt: string
  serverHash: string
}

export interface AiChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: string
  status: "done" | "streaming" | "error"
}

export interface FilledSpec {
  label: string
  value: string
}

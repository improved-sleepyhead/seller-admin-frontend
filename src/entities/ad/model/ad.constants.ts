import type {
  AdCategory,
  AutoParams,
  ElectronicsParams,
  RealEstateParams
} from "./ad.types"

type AutoParamKey = keyof AutoParams
type RealEstateParamKey = keyof RealEstateParams
type ElectronicsParamKey = keyof ElectronicsParams

export const AD_CATEGORY_LABELS: Record<AdCategory, string> = {
  auto: "Авто",
  electronics: "Электроника",
  real_estate: "Недвижимость"
}

export const AD_CORE_FIELD_LABELS = {
  description: "Описание"
} as const

export const AUTO_REQUIRED_KEYS: AutoParamKey[] = [
  "brand",
  "model",
  "yearOfManufacture",
  "transmission",
  "mileage",
  "enginePower"
]

export const REAL_ESTATE_REQUIRED_KEYS: RealEstateParamKey[] = [
  "type",
  "address",
  "area",
  "floor"
]

export const ELECTRONICS_REQUIRED_KEYS: ElectronicsParamKey[] = [
  "type",
  "brand",
  "model",
  "condition",
  "color"
]

export const REQUIRED_KEYS_BY_CATEGORY = {
  auto: AUTO_REQUIRED_KEYS,
  electronics: ELECTRONICS_REQUIRED_KEYS,
  real_estate: REAL_ESTATE_REQUIRED_KEYS
} as const

export const AUTO_KEY_LABELS: Record<AutoParamKey, string> = {
  brand: "Бренд",
  enginePower: "Мощность двигателя",
  mileage: "Пробег",
  model: "Модель",
  transmission: "Коробка передач",
  yearOfManufacture: "Год выпуска"
}

export const REAL_ESTATE_KEY_LABELS: Record<RealEstateParamKey, string> = {
  address: "Адрес",
  area: "Площадь",
  floor: "Этаж",
  type: "Тип недвижимости"
}

export const ELECTRONICS_KEY_LABELS: Record<ElectronicsParamKey, string> = {
  brand: "Бренд",
  color: "Цвет",
  condition: "Состояние",
  model: "Модель",
  type: "Тип устройства"
}

export const KEY_LABELS_BY_CATEGORY = {
  auto: AUTO_KEY_LABELS,
  electronics: ELECTRONICS_KEY_LABELS,
  real_estate: REAL_ESTATE_KEY_LABELS
} as const

export const AUTO_TRANSMISSION_LABELS: Record<
  NonNullable<AutoParams["transmission"]>,
  string
> = {
  automatic: "Автомат",
  manual: "Механика"
}

export const REAL_ESTATE_TYPE_LABELS: Record<
  NonNullable<RealEstateParams["type"]>,
  string
> = {
  flat: "Квартира",
  house: "Дом",
  room: "Комната"
}

export const ELECTRONICS_TYPE_LABELS: Record<
  NonNullable<ElectronicsParams["type"]>,
  string
> = {
  laptop: "Ноутбук",
  misc: "Другое",
  phone: "Телефон"
}

export const ELECTRONICS_CONDITION_LABELS: Record<
  NonNullable<ElectronicsParams["condition"]>,
  string
> = {
  new: "Новый",
  used: "Б/у"
}

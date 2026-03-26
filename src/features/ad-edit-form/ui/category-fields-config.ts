import type { AdEditFormValues } from "@/entities/ad"

export type AdCategory = AdEditFormValues["category"]

export type CategoryParamFieldName =
  | "params.brand"
  | "params.model"
  | "params.yearOfManufacture"
  | "params.transmission"
  | "params.mileage"
  | "params.enginePower"
  | "params.type"
  | "params.address"
  | "params.area"
  | "params.floor"
  | "params.condition"
  | "params.color"

interface CategoryFieldConfigBase {
  name: CategoryParamFieldName
  label: string
  placeholder?: string
}

export interface CategoryTextFieldConfig extends CategoryFieldConfigBase {
  kind: "text"
}

export interface CategoryNumberFieldConfig extends CategoryFieldConfigBase {
  kind: "number"
}

export interface CategorySelectFieldConfig extends CategoryFieldConfigBase {
  kind: "select"
  options: {
    value: string
    label: string
  }[]
  placeholder: string
}

export type CategoryFieldConfig =
  | CategoryTextFieldConfig
  | CategoryNumberFieldConfig
  | CategorySelectFieldConfig

const CATEGORY_PARAMS_DEFAULTS = {
  auto: {
    brand: "",
    enginePower: "",
    mileage: "",
    model: "",
    transmission: "",
    yearOfManufacture: ""
  },
  electronics: {
    brand: "",
    color: "",
    condition: "",
    model: "",
    type: ""
  },
  real_estate: {
    address: "",
    area: "",
    floor: "",
    type: ""
  }
} satisfies Record<AdCategory, Record<string, string | number | undefined>>

export const CATEGORY_FIELDS_CONFIG = {
  auto: [
    { kind: "text", label: "Бренд", name: "params.brand" },
    { kind: "text", label: "Модель", name: "params.model" },
    { kind: "number", label: "Год выпуска", name: "params.yearOfManufacture" },
    {
      kind: "select",
      label: "Коробка передач",
      name: "params.transmission",
      options: [
        { label: "Автомат", value: "automatic" },
        { label: "Механика", value: "manual" }
      ],
      placeholder: "Выберите тип"
    },
    { kind: "number", label: "Пробег", name: "params.mileage" },
    { kind: "number", label: "Мощность двигателя", name: "params.enginePower" }
  ],
  electronics: [
    {
      kind: "select",
      label: "Тип устройства",
      name: "params.type",
      options: [
        { label: "Телефон", value: "phone" },
        { label: "Ноутбук", value: "laptop" },
        { label: "Другое", value: "misc" }
      ],
      placeholder: "Выберите тип"
    },
    { kind: "text", label: "Бренд", name: "params.brand" },
    { kind: "text", label: "Модель", name: "params.model" },
    {
      kind: "select",
      label: "Состояние",
      name: "params.condition",
      options: [
        { label: "Новый", value: "new" },
        { label: "Б/у", value: "used" }
      ],
      placeholder: "Выберите состояние"
    },
    { kind: "text", label: "Цвет", name: "params.color" }
  ],
  real_estate: [
    {
      kind: "select",
      label: "Тип недвижимости",
      name: "params.type",
      options: [
        { label: "Квартира", value: "flat" },
        { label: "Дом", value: "house" },
        { label: "Комната", value: "room" }
      ],
      placeholder: "Выберите тип"
    },
    { kind: "text", label: "Адрес", name: "params.address" },
    { kind: "number", label: "Площадь", name: "params.area" },
    { kind: "number", label: "Этаж", name: "params.floor" }
  ]
} satisfies Record<AdCategory, CategoryFieldConfig[]>

export function getCategoryDefaultParams(category: AdCategory) {
  return { ...CATEGORY_PARAMS_DEFAULTS[category] }
}

import { describe, expect, it } from "vitest"

import { doesNeedRevision, getMissingFields } from "../ad.revision"

import type { AutoAd, ElectronicsAd, RealEstateAd } from "../ad.types"

const TIMESTAMP = "2026-03-29T00:00:00.000Z"

function createAutoAd(
  params: Partial<AutoAd["params"]> = {},
  description = "Подробное описание"
): AutoAd {
  return {
    id: 1,
    category: "auto",
    title: "Mitsubishi Outlander",
    description,
    price: 1_200_000,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    params: {
      brand: "Mitsubishi",
      model: "Outlander",
      yearOfManufacture: 2018,
      transmission: "automatic",
      mileage: 95_000,
      enginePower: 167,
      ...params
    }
  }
}

function createElectronicsAd(
  params: Partial<ElectronicsAd["params"]> = {},
  description = "Почти новый ноутбук"
): ElectronicsAd {
  return {
    id: 2,
    category: "electronics",
    title: "Ноутбук",
    description,
    price: 90_000,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    params: {
      type: "laptop",
      brand: "Lenovo",
      model: "ThinkPad T14",
      condition: "used",
      color: "Черный",
      ...params
    }
  }
}

function createRealEstateAd(
  params: Partial<RealEstateAd["params"]> = {},
  description = "Уютная квартира"
): RealEstateAd {
  return {
    id: 3,
    category: "real_estate",
    title: "Квартира",
    description,
    price: 7_000_000,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    params: {
      type: "flat",
      address: "Москва, ул. Пушкина, д. 1",
      area: 42,
      floor: 6,
      ...params
    }
  }
}

describe("doesNeedRevision", () => {
  it("should return true when description contains only spaces", () => {
    const ad = createElectronicsAd({}, "   ")

    expect(doesNeedRevision(ad)).toBe(true)
  })

  it("should return true when auto brand is empty", () => {
    const ad = createAutoAd({ brand: " " })

    expect(doesNeedRevision(ad)).toBe(true)
  })

  it("should return false when all required fields are filled", () => {
    const ad = createElectronicsAd()

    expect(doesNeedRevision(ad)).toBe(false)
  })

  it("should return true when all real estate params are empty", () => {
    const ad = createRealEstateAd({
      type: undefined,
      address: " ",
      area: Number.NaN,
      floor: undefined
    })

    expect(doesNeedRevision(ad)).toBe(true)
  })
})

describe("getMissingFields", () => {
  it("should include brand label for auto when brand is empty", () => {
    const ad = createAutoAd({ brand: " " })

    expect(getMissingFields(ad)).toContain("Бренд")
  })

  it("should return readable labels for empty real estate fields", () => {
    const ad = createRealEstateAd(
      {
        type: undefined,
        address: "",
        area: undefined,
        floor: undefined
      },
      " "
    )

    expect(getMissingFields(ad)).toEqual([
      "Описание",
      "Тип недвижимости",
      "Адрес",
      "Площадь",
      "Этаж"
    ])
  })

  it("should return empty array when required fields are filled", () => {
    const ad = createAutoAd()

    expect(getMissingFields(ad)).toEqual([])
  })
})

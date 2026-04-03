import { describe, expect, it } from "vitest"

import { getFilledSpecs } from "../ad.specs"

import type { AutoAd, ElectronicsAd } from "../ad.types"

const TIMESTAMP = "2026-03-29T00:00:00.000Z"

function createAutoAd(params: Partial<AutoAd["params"]> = {}): AutoAd {
  return {
    id: 11,
    category: "auto",
    title: "Skoda Octavia",
    description: "Описание",
    price: 1_100_000,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    params: {
      brand: "Skoda",
      model: "Octavia",
      yearOfManufacture: 2020,
      transmission: "automatic",
      mileage: 54_000,
      enginePower: 150,
      ...params
    }
  }
}

function createElectronicsAd(
  params: Partial<ElectronicsAd["params"]> = {}
): ElectronicsAd {
  return {
    id: 12,
    category: "electronics",
    title: "Телефон",
    description: "Описание",
    price: 70_000,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    params: {
      type: "phone",
      brand: "Apple",
      model: "iPhone 14",
      condition: "used",
      color: "Черный",
      ...params
    }
  }
}

describe("getFilledSpecs", () => {
  it("should return only filled specs for partially filled auto params", () => {
    const ad = createAutoAd({
      brand: "Skoda",
      model: "Octavia",
      yearOfManufacture: 2020,
      transmission: undefined,
      mileage: undefined,
      enginePower: undefined
    })

    expect(getFilledSpecs(ad)).toEqual([
      { label: "Бренд", value: "Skoda" },
      { label: "Модель", value: "Octavia" },
      { label: "Год выпуска", value: "2020" }
    ])
  })

  it("should include all five specs for fully filled electronics params", () => {
    const ad = createElectronicsAd()

    expect(getFilledSpecs(ad)).toEqual([
      { label: "Тип устройства", value: "Телефон" },
      { label: "Бренд", value: "Apple" },
      { label: "Модель", value: "iPhone 14" },
      { label: "Состояние", value: "Б/у" },
      { label: "Цвет", value: "Черный" }
    ])
  })

  it("should trim string values in specs", () => {
    const ad = createElectronicsAd({ color: "  Серебристый  " })

    expect(getFilledSpecs(ad)).toContainEqual({
      label: "Цвет",
      value: "Серебристый"
    })
  })

  it("should return empty specs when all electronics params are empty", () => {
    const ad = createElectronicsAd({
      type: undefined,
      brand: " ",
      model: "",
      condition: undefined,
      color: " "
    })

    expect(getFilledSpecs(ad)).toEqual([])
  })
})

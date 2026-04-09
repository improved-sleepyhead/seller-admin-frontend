import { describe, expect, it } from "vitest"

import {
  areAdEditFormValuesEqual,
  getAdServerHash,
  normalizeAdEditFormValues,
  toAdEditFormValues,
  toItemPatch,
  toItemUpdate
} from "../ad-form.codec"

import type { AdDetailsDto } from "../../api"
import type { AdEditFormValues } from "../ad.types"

const TIMESTAMP = "2026-04-09T12:00:00.000Z"

const electronicsAd: Extract<AdDetailsDto, { category: "electronics" }> = {
  category: "electronics",
  createdAt: TIMESTAMP,
  description: "Описание",
  id: 7,
  params: {
    brand: "Apple",
    color: "Silver",
    condition: "used",
    model: "MacBook Pro",
    type: "laptop"
  },
  price: 150_000,
  title: "Ноутбук",
  updatedAt: TIMESTAMP
}

describe("ad-form.codec", () => {
  it("should map ad details dto to form values", () => {
    expect(toAdEditFormValues(electronicsAd)).toEqual({
      category: "electronics",
      description: "Описание",
      params: {
        brand: "Apple",
        color: "Silver",
        condition: "used",
        model: "MacBook Pro",
        type: "laptop"
      },
      price: 150_000,
      title: "Ноутбук"
    })
  })

  it("should build full item update payload from form values", () => {
    const formValues: AdEditFormValues = {
      category: "auto",
      description: "  Честное описание  ",
      params: {
        brand: "  Toyota ",
        enginePower: "150",
        mileage: "120000",
        model: " Corolla ",
        transmission: "automatic",
        yearOfManufacture: "2018"
      },
      price: "900000",
      title: "  Toyota Corolla  "
    }

    expect(toItemUpdate(formValues)).toEqual({
      category: "auto",
      description: "Честное описание",
      params: {
        brand: "Toyota",
        enginePower: 150,
        mileage: 120000,
        model: "Corolla",
        transmission: "automatic",
        yearOfManufacture: 2018
      },
      price: 900000,
      title: "Toyota Corolla"
    })
  })

  it("should build patch payload from partial form values", () => {
    const formValues: AdEditFormValues = {
      category: "auto",
      description: "  Описание  ",
      params: {
        brand: "  Toyota ",
        enginePower: "",
        mileage: "",
        model: "",
        transmission: "",
        yearOfManufacture: ""
      },
      price: "900000",
      title: "  Toyota Corolla  "
    }

    expect(toItemPatch(formValues)).toEqual({
      category: "auto",
      description: "Описание",
      params: {
        brand: "Toyota",
        enginePower: undefined,
        mileage: undefined,
        model: undefined,
        transmission: undefined,
        yearOfManufacture: undefined
      },
      price: 900000,
      title: "Toyota Corolla"
    })
  })

  it("should normalize numeric draft values before comparison", () => {
    const left: AdEditFormValues = {
      category: "real_estate",
      description: "",
      params: {
        address: "Москва",
        area: "42",
        floor: 5,
        type: "flat"
      },
      price: "7000000",
      title: "Квартира"
    }
    const right: AdEditFormValues = {
      category: "real_estate",
      description: "",
      params: {
        address: "Москва",
        area: 42,
        floor: "5",
        type: "flat"
      },
      price: 7000000,
      title: "Квартира"
    }

    expect(normalizeAdEditFormValues(left)).toEqual(normalizeAdEditFormValues(right))
    expect(areAdEditFormValuesEqual(left, right)).toBe(true)
  })

  it("should build stable server hash from dto metadata", () => {
    expect(getAdServerHash(electronicsAd)).toBe(`7:${TIMESTAMP}`)
  })
})

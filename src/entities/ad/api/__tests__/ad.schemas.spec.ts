import { describe, expect, it } from "vitest"

import {
  AdDetailsSchema,
  AdListResponseSchema,
  ItemPatchInSchema,
  ItemUpdateInSchema
} from "../ad.schemas"

const TIMESTAMP = "2026-03-30T00:00:00.000Z"

describe("AdListResponseSchema", () => {
  it("should parse valid get items response", () => {
    const parseResult = AdListResponseSchema.safeParse({
      items: [
        {
          category: "auto",
          createdAt: TIMESTAMP,
          id: 1,
          params: {
            brand: "Toyota",
            model: "Camry"
          },
          price: 1_500_000,
          title: "Toyota Camry",
          updatedAt: TIMESTAMP
        }
      ],
      total: 1
    })

    expect(parseResult.success).toBe(true)
  })

  it("should reject response item without id", () => {
    const parseResult = AdListResponseSchema.safeParse({
      items: [
        {
          category: "auto",
          createdAt: TIMESTAMP,
          params: {
            brand: "Toyota",
            model: "Camry"
          },
          price: 1_500_000,
          title: "Toyota Camry",
          updatedAt: TIMESTAMP
        }
      ],
      total: 1
    })

    expect(parseResult.success).toBe(false)
  })
})

describe("AdDetailsSchema", () => {
  it("should parse auto details", () => {
    const parseResult = AdDetailsSchema.safeParse({
      category: "auto",
      createdAt: TIMESTAMP,
      id: 1,
      params: {
        brand: "Toyota",
        enginePower: 150,
        mileage: 100000,
        model: "Corolla",
        transmission: "automatic",
        yearOfManufacture: 2017
      },
      price: 900_000,
      title: "Toyota Corolla",
      updatedAt: TIMESTAMP
    })

    expect(parseResult.success).toBe(true)
  })

  it("should parse real estate details", () => {
    const parseResult = AdDetailsSchema.safeParse({
      category: "real_estate",
      createdAt: TIMESTAMP,
      id: 2,
      params: {
        address: "Москва, ул. Ленина, 1",
        area: 55,
        floor: 7,
        type: "flat"
      },
      price: 10_000_000,
      title: "Квартира",
      updatedAt: TIMESTAMP
    })

    expect(parseResult.success).toBe(true)
  })

  it("should parse electronics details", () => {
    const parseResult = AdDetailsSchema.safeParse({
      category: "electronics",
      createdAt: TIMESTAMP,
      id: 3,
      params: {
        brand: "Apple",
        color: "Space Gray",
        condition: "used",
        model: "MacBook Pro",
        type: "laptop"
      },
      price: 120_000,
      title: "MacBook Pro",
      updatedAt: TIMESTAMP
    })

    expect(parseResult.success).toBe(true)
  })
})

describe("ItemUpdateInSchema", () => {
  it("should parse valid auto update payload", () => {
    const parseResult = ItemUpdateInSchema.safeParse({
      category: "auto",
      description: "Состояние хорошее",
      params: {
        brand: "Toyota",
        enginePower: 150,
        mileage: 100000,
        model: "Corolla",
        transmission: "automatic",
        yearOfManufacture: 2017
      },
      price: 900_000,
      title: "Toyota Corolla"
    })

    expect(parseResult.success).toBe(true)
  })

  it("should reject invalid auto update payload", () => {
    const parseResult = ItemUpdateInSchema.safeParse({
      category: "auto",
      description: "Состояние хорошее",
      params: {
        brand: "Toyota",
        enginePower: 150,
        mileage: 100000,
        transmission: "automatic",
        yearOfManufacture: 2017
      },
      price: 900_000,
      title: "Toyota Corolla"
    })

    expect(parseResult.success).toBe(false)
  })

  it("should parse valid real estate update payload", () => {
    const parseResult = ItemUpdateInSchema.safeParse({
      category: "real_estate",
      description: "Светлая квартира",
      params: {
        address: "Москва, ул. Ленина, 1",
        area: 55,
        floor: 7,
        type: "flat"
      },
      price: 10_000_000,
      title: "Квартира"
    })

    expect(parseResult.success).toBe(true)
  })

  it("should reject invalid real estate update payload", () => {
    const parseResult = ItemUpdateInSchema.safeParse({
      category: "real_estate",
      description: "Светлая квартира",
      params: {
        area: 55,
        floor: 7,
        type: "flat"
      },
      price: 10_000_000,
      title: "Квартира"
    })

    expect(parseResult.success).toBe(false)
  })

  it("should parse valid electronics update payload", () => {
    const parseResult = ItemUpdateInSchema.safeParse({
      category: "electronics",
      description: "Отличное состояние",
      params: {
        brand: "Apple",
        color: "Space Gray",
        condition: "used",
        model: "MacBook Pro",
        type: "laptop"
      },
      price: 120_000,
      title: "MacBook Pro"
    })

    expect(parseResult.success).toBe(true)
  })

  it("should reject invalid electronics update payload", () => {
    const parseResult = ItemUpdateInSchema.safeParse({
      category: "electronics",
      description: "Отличное состояние",
      params: {
        brand: "Apple",
        condition: "used",
        model: "MacBook Pro",
        type: "laptop"
      },
      price: 120_000,
      title: "MacBook Pro"
    })

    expect(parseResult.success).toBe(false)
  })
})

describe("ItemPatchInSchema", () => {
  it("should parse partial patch payload", () => {
    const parseResult = ItemPatchInSchema.safeParse({
      category: "auto",
      params: {
        mileage: 120000
      },
      title: "Toyota Corolla"
    })

    expect(parseResult.success).toBe(true)
  })

  it("should reject empty patch payload", () => {
    const parseResult = ItemPatchInSchema.safeParse({
      category: "auto"
    })

    expect(parseResult.success).toBe(false)
  })
})

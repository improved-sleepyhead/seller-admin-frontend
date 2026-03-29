import { describe, expect, it } from "vitest"

import { AdEditFormSchema } from "../ad-edit-form.schema"

const validForm = {
  category: "auto" as const,
  description: "Описание",
  params: {
    brand: "Toyota"
  },
  price: 1000000,
  title: "Заголовок"
}

describe("AdEditFormSchema", () => {
  it("should parse valid form values", () => {
    const parseResult = AdEditFormSchema.safeParse(validForm)

    expect(parseResult.success).toBe(true)
  })

  it("should reject empty title", () => {
    const parseResult = AdEditFormSchema.safeParse({
      ...validForm,
      title: "   "
    })

    expect(parseResult.success).toBe(false)
  })

  it("should reject zero numeric price", () => {
    const parseResult = AdEditFormSchema.safeParse({
      ...validForm,
      price: 0
    })

    expect(parseResult.success).toBe(false)
  })

  it("should reject zero string price", () => {
    const parseResult = AdEditFormSchema.safeParse({
      ...validForm,
      price: "0"
    })

    expect(parseResult.success).toBe(false)
  })

  it("should accept positive string price with spaces", () => {
    const parseResult = AdEditFormSchema.safeParse({
      ...validForm,
      price: " 1500000 "
    })

    expect(parseResult.success).toBe(true)
  })

  it("should reject description longer than 1000 symbols", () => {
    const parseResult = AdEditFormSchema.safeParse({
      ...validForm,
      description: "a".repeat(1001)
    })

    expect(parseResult.success).toBe(false)
  })

  it("should accept description with exactly 1000 symbols", () => {
    const parseResult = AdEditFormSchema.safeParse({
      ...validForm,
      description: "a".repeat(1000)
    })

    expect(parseResult.success).toBe(true)
  })
})

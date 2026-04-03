import { describe, expect, it } from "vitest"

import { AdDraftSchema } from "../ad-draft.schema"

const validDraft = {
  form: {
    category: "electronics" as const,
    description: "Описание",
    params: {
      brand: "Apple",
      color: "Black"
    },
    price: "150000",
    title: "MacBook Pro"
  },
  itemId: 1,
  savedAt: "2026-03-30T00:00:00.000Z",
  serverHash: "hash_v1"
}

describe("AdDraftSchema", () => {
  it("should parse valid draft payload", () => {
    const parseResult = AdDraftSchema.safeParse(validDraft)

    expect(parseResult.success).toBe(true)
  })

  it("should reject draft payload with invalid itemId", () => {
    const parseResult = AdDraftSchema.safeParse({
      ...validDraft,
      itemId: 0
    })

    expect(parseResult.success).toBe(false)
  })

  it("should reject draft payload with invalid savedAt", () => {
    const parseResult = AdDraftSchema.safeParse({
      ...validDraft,
      savedAt: "not-a-date"
    })

    expect(parseResult.success).toBe(false)
  })

  it("should reject draft payload with empty serverHash", () => {
    const parseResult = AdDraftSchema.safeParse({
      ...validDraft,
      serverHash: ""
    })

    expect(parseResult.success).toBe(false)
  })
})

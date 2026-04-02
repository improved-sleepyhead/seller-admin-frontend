import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/shared/api/client", () => ({
  apiGet: vi.fn(),
  apiPatch: vi.fn(),
  apiPost: vi.fn()
}))

import { apiGet, apiPatch, apiPost } from "@/shared/api/client"
import { AppApiError } from "@/shared/api/error"

import {
  getAdById,
  getAdsList,
  getAiStatus,
  patchAd,
  requestAiDescription,
  requestAiPrice
} from "../ad.api"

import type { ItemPatchIn, ItemUpdateIn } from "../ad.contracts"

const apiGetMock = vi.mocked(apiGet)
const apiPatchMock = vi.mocked(apiPatch)
const apiPostMock = vi.mocked(apiPost)

const signal = new AbortController().signal

const autoItem: ItemUpdateIn = {
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
}

describe("ad.api", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should build GET /items request and parse list response", async () => {
    apiGetMock.mockResolvedValue({
      items: [
        {
          category: "auto",
          createdAt: "2026-04-01T00:00:00.000Z",
          id: 1,
          params: {
            brand: "Toyota",
            model: "Corolla"
          },
          price: 900_000,
          title: "Toyota Corolla",
          updatedAt: "2026-04-01T00:00:00.000Z"
        }
      ],
      total: 1
    })

    const response = await getAdsList(
      {
        categories: ["auto"],
        limit: 9,
        needsRevision: true,
        q: "toyota",
        skip: 0,
        sortColumn: "price",
        sortDirection: "asc"
      },
      signal
    )

    expect(apiGetMock).toHaveBeenCalledWith(
      "/items?q=toyota&categories=auto&needsRevision=true&limit=9&skip=0&sortColumn=price&sortDirection=asc",
      signal
    )
    expect(response.total).toBe(1)
    expect(response.items[0]?.id).toBe(1)
  })

  it("should build PATCH /items/:id request and parse success dto", async () => {
    const item: ItemPatchIn = {
      category: "auto",
      description: "Новое описание",
      params: {
        brand: "Toyota"
      },
      price: 910_000,
      title: "Toyota Corolla"
    }

    apiPatchMock.mockResolvedValue({ success: true })

    const response = await patchAd(1, item, signal)

    expect(apiPatchMock).toHaveBeenCalledWith("/items/1", item, signal)
    expect(response).toEqual({ success: true })
  })

  it("should parse AI endpoints with real dto payloads", async () => {
    apiGetMock.mockResolvedValueOnce({
      enabled: true,
      features: {
        chat: true,
        description: true,
        price: true
      },
      model: "openrouter/test-model",
      provider: "openrouter"
    })
    apiPostMock
      .mockResolvedValueOnce({
        model: "openrouter/test-model",
        suggestion: "Подробное описание",
        usage: {
          totalTokens: 42
        }
      })
      .mockResolvedValueOnce({
        currency: "RUB",
        model: "openrouter/test-model",
        reasoning: "Ориентир по рынку",
        suggestedPrice: 950_000,
        usage: {
          totalTokens: 51
        }
      })

    const status = await getAiStatus(signal)
    const description = await requestAiDescription(autoItem, signal)
    const price = await requestAiPrice(autoItem, signal)

    expect(apiGetMock).toHaveBeenCalledWith("/api/ai/status", signal)
    expect(apiPostMock).toHaveBeenNthCalledWith(
      1,
      "/api/ai/description",
      { item: autoItem },
      signal
    )
    expect(apiPostMock).toHaveBeenNthCalledWith(
      2,
      "/api/ai/price",
      { item: autoItem },
      signal
    )
    expect(status.enabled).toBe(true)
    expect(description.suggestion).toBe("Подробное описание")
    expect(price.suggestedPrice).toBe(950_000)
  })

  it("should normalize transport errors into AppApiError", async () => {
    apiGetMock.mockRejectedValue(new Error("boom"))

    await expect(getAdById(1, signal)).rejects.toBeInstanceOf(AppApiError)
    await expect(getAdById(1, signal)).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "boom"
    })
  })
})

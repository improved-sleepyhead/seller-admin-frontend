import { beforeEach, describe, expect, it, vi } from "vitest"
import { z } from "zod/v4"

vi.mock("@/shared/api/client", () => ({
  apiGet: vi.fn(),
  apiPatch: vi.fn(),
  apiPost: vi.fn()
}))

import { apiGet, apiPatch, apiPost } from "@/shared/api/client"
import type { AppApiError } from "@/shared/api/error"

import {
  getParsedResponse,
  patchParsedResponse,
  postParsedResponse
} from "../ad.request"

const apiGetMock = vi.mocked(apiGet)
const apiPatchMock = vi.mocked(apiPatch)
const apiPostMock = vi.mocked(apiPost)

const signal = new AbortController().signal

describe("ad.request", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should parse valid payloads through read and write helpers", async () => {
    const schema = z.object({
      success: z.literal(true)
    })

    apiGetMock.mockResolvedValueOnce({ success: true })
    apiPostMock.mockResolvedValueOnce({ success: true })
    apiPatchMock.mockResolvedValueOnce({ success: true })

    await expect(
      getParsedResponse({
        schema,
        signal,
        url: "/items/1"
      })
    ).resolves.toEqual({ success: true })

    await expect(
      postParsedResponse({
        body: { foo: "bar" },
        schema,
        signal,
        url: "/api/ai/price"
      })
    ).resolves.toEqual({ success: true })

    await expect(
      patchParsedResponse({
        body: { foo: "bar" },
        schema,
        signal,
        url: "/items/1"
      })
    ).resolves.toEqual({ success: true })
  })

  it("should normalize parse and transport failures in a single format", async () => {
    const schema = z.object({
      id: z.number()
    })

    apiGetMock.mockResolvedValueOnce({ id: "wrong" })
    apiPostMock.mockRejectedValueOnce(new Error("boom"))

    await expect(
      getParsedResponse({
        schema,
        signal,
        url: "/items/1"
      })
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      status: null
    } satisfies Partial<AppApiError>)

    await expect(
      postParsedResponse({
        body: { foo: "bar" },
        schema,
        signal,
        url: "/api/ai/description"
      })
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "boom",
      status: null
    } satisfies Partial<AppApiError>)
  })
})

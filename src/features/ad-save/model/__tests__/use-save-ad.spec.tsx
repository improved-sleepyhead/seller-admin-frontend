/* @vitest-environment jsdom */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
  return {
    clearAdDraftAndChatStorageMock: vi.fn(),
    errorToastMock: vi.fn(),
    invalidateAdAfterSaveMock: vi.fn(),
    mutationFnMock: vi.fn(),
    navigateMock: vi.fn(),
    successToastMock: vi.fn()
  }
})

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>("react-router-dom")

  return {
    ...actual,
    useNavigate: () => mocks.navigateMock
  }
})

vi.mock("sonner", () => {
  return {
    toast: {
      error: mocks.errorToastMock,
      success: mocks.successToastMock
    }
  }
})

vi.mock("@/entities/ad/api", () => {
  return {
    invalidateAdAfterSave: mocks.invalidateAdAfterSaveMock,
    updateAdMutation: (itemId: number) => {
      return {
        mutationFn: mocks.mutationFnMock,
        mutationKey: ["ads", itemId, "update"] as const
      }
    }
  }
})

vi.mock("../ad-save.storage", () => {
  return {
    clearAdDraftAndChatStorage: mocks.clearAdDraftAndChatStorageMock
  }
})

import type { AdEditFormValues } from "@/entities/ad/model"
import { toItemPatch } from "@/entities/ad/model"
import type { AdsListNavigationState } from "@/entities/ad-list"

import { useSaveAd } from "../use-save-ad"

import type { PropsWithChildren } from "react"

const FORM_VALUES: AdEditFormValues = {
  category: "electronics",
  description: "Ноутбук в хорошем состоянии",
  params: {
    brand: "Apple",
    color: "Silver",
    condition: "used",
    model: "MacBook Pro",
    type: "laptop"
  },
  price: 120000,
  title: "MacBook Pro"
}

const PARTIAL_FORM_VALUES: AdEditFormValues = {
  category: "electronics",
  description: "Краткое описание",
  params: {
    brand: "",
    color: "",
    condition: "used",
    model: "MacBook Air",
    type: "laptop"
  },
  price: "90000",
  title: "Черновик ноутбука"
}

const NAVIGATION_STATE: AdsListNavigationState = {
  adsSearch: "?q=macbook"
}

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false
      },
      queries: {
        retry: false
      }
    }
  })
}

function createWrapper(queryClient = createTestQueryClient()) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  return {
    queryClient,
    wrapper: Wrapper
  }
}

describe("useSaveAd", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.invalidateAdAfterSaveMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should persist ad, clear local storage, invalidate queries and navigate on success", async () => {
    mocks.mutationFnMock.mockResolvedValue({
      success: true
    })

    const { queryClient, wrapper } = createWrapper()
    const { result } = renderHook(
      () =>
        useSaveAd({
          itemId: 42,
          navigationState: NAVIGATION_STATE
        }),
      {
        wrapper
      }
    )

    await act(async () => {
      await result.current.saveAd(FORM_VALUES)
    })

    expect(mocks.mutationFnMock).toHaveBeenCalledTimes(1)

    const mutationVariables = mocks.mutationFnMock.mock.calls[0]?.[0] as {
      item: unknown
      signal: AbortSignal
    }

    expect(mutationVariables.item).toEqual(toItemPatch(FORM_VALUES))
    expect(mutationVariables.signal).toBeInstanceOf(AbortSignal)

    await waitFor(() => {
      expect(mocks.invalidateAdAfterSaveMock).toHaveBeenCalledWith(
        queryClient,
        42
      )
    })

    expect(mocks.clearAdDraftAndChatStorageMock).toHaveBeenCalledWith(42)
    expect(mocks.successToastMock).toHaveBeenCalledWith("Объявление сохранено.")
    expect(mocks.navigateMock).toHaveBeenCalledWith("/ads/42", {
      state: NAVIGATION_STATE
    })
  })

  it("should build partial save payload for incomplete form values", async () => {
    mocks.mutationFnMock.mockResolvedValue({
      success: true
    })

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () =>
        useSaveAd({
          itemId: 42
        }),
      {
        wrapper
      }
    )

    await act(async () => {
      await result.current.saveAd(PARTIAL_FORM_VALUES)
    })

    const mutationVariables = mocks.mutationFnMock.mock.calls[0]?.[0] as {
      item: unknown
      signal: AbortSignal
    }

    expect(mutationVariables.item).toEqual({
      category: "electronics",
      description: "Краткое описание",
      params: {
        brand: undefined,
        color: undefined,
        condition: "used",
        model: "MacBook Air",
        type: "laptop"
      },
      price: 90000,
      title: "Черновик ноутбука"
    })
  })

  it("should show error toast and keep local state untouched when save fails", async () => {
    mocks.mutationFnMock.mockRejectedValue(new Error("Ошибка сохранения"))

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () =>
        useSaveAd({
          itemId: 42
        }),
      {
        wrapper
      }
    )

    await act(async () => {
      await expect(result.current.saveAd(FORM_VALUES)).rejects.toThrow(
        "Ошибка сохранения"
      )
    })

    expect(mocks.errorToastMock).toHaveBeenCalledWith("Ошибка сохранения")
    expect(mocks.invalidateAdAfterSaveMock).not.toHaveBeenCalled()
    expect(mocks.clearAdDraftAndChatStorageMock).not.toHaveBeenCalled()
    expect(mocks.successToastMock).not.toHaveBeenCalled()
    expect(mocks.navigateMock).not.toHaveBeenCalled()
  })
})

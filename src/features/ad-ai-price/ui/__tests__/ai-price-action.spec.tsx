/* @vitest-environment jsdom */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react"
import { useState, type ReactElement } from "react"
import { useForm } from "react-hook-form"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/entities/ad/api", async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>("@/entities/ad/api")

  return {
    ...actual,
    requestAiPrice: vi.fn()
  }
})

import { requestAiPrice } from "@/entities/ad/api"
import type { AdEditFormValues } from "@/entities/ad/model"

import { AiPriceAction } from "../ai-price-action"

const requestAiPriceMock = vi.mocked(requestAiPrice)

const DEFAULT_FORM_VALUES: AdEditFormValues = {
  category: "electronics",
  description: "Старое описание",
  params: {
    brand: "Apple",
    color: "black",
    condition: "used",
    model: "MacBook Pro",
    type: "laptop"
  },
  price: 120000,
  title: "MacBook"
}

function createQueryClient(): QueryClient {
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

function createMatchMedia(): typeof window.matchMedia {
  return (query: string): MediaQueryList => {
    return {
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn()
    }
  }
}

function AiPriceActionHarness(): ReactElement {
  const [queryClient] = useState(createQueryClient)
  const form = useForm<AdEditFormValues>({
    defaultValues: DEFAULT_FORM_VALUES
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AiPriceAction disabled={false} form={form} />
      <output data-testid="price-value">{String(form.watch("price"))}</output>
    </QueryClientProvider>
  )
}

describe("AiPriceAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: createMatchMedia(),
      writable: true
    })
  })

  afterEach(() => {
    cleanup()
  })

  it("should update form price only after explicit apply action", async () => {
    requestAiPriceMock.mockResolvedValue({
      currency: "RUB",
      reasoning: "Рыночная цена",
      suggestedPrice: 150000
    })

    render(<AiPriceActionHarness />)

    expect(screen.getByTestId("price-value").textContent).toBe("120000")

    fireEvent.click(screen.getByRole("button", { name: "Предложить цену" }))

    await waitFor(() => {
      expect(requestAiPriceMock).toHaveBeenCalledTimes(1)
    })

    await screen.findByRole("button", { name: "Применить цену" })

    expect(screen.getByTestId("price-value").textContent).toBe("120000")

    fireEvent.click(screen.getByRole("button", { name: "Применить цену" }))

    await waitFor(() => {
      expect(screen.getByTestId("price-value").textContent).toBe("150000")
    })
  })

  it("should keep existing price when user dismisses AI suggestion", async () => {
    requestAiPriceMock.mockResolvedValue({
      currency: "RUB",
      reasoning: "Другая рекомендация",
      suggestedPrice: 170000
    })

    render(<AiPriceActionHarness />)

    fireEvent.click(screen.getByRole("button", { name: "Предложить цену" }))

    fireEvent.click(
      await screen.findByRole("button", { name: "Оставить текущую" })
    )

    expect(screen.getByTestId("price-value").textContent).toBe("120000")
  })
})

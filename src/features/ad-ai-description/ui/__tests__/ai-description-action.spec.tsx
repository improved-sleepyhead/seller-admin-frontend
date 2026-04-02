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
    requestAiDescription: vi.fn()
  }
})

import { requestAiDescription } from "@/entities/ad/api"
import type { AdEditFormValues } from "@/entities/ad/model"

import { AiDescriptionAction } from "../ai-description-action"

const requestAiDescriptionMock = vi.mocked(requestAiDescription)

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

function createMatchMedia(isMobile = false): typeof window.matchMedia {
  return (query: string): MediaQueryList => {
    return {
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: isMobile,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn()
    }
  }
}

function AiDescriptionActionHarness(): ReactElement {
  const [queryClient] = useState(createQueryClient)
  const form = useForm<AdEditFormValues>({
    defaultValues: DEFAULT_FORM_VALUES
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AiDescriptionAction disabled={false} form={form} />
      <output data-testid="description-value">
        {String(form.watch("description"))}
      </output>
    </QueryClientProvider>
  )
}

describe("AiDescriptionAction", () => {
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

  it("should update form description only after explicit apply action", async () => {
    requestAiDescriptionMock.mockResolvedValue({
      suggestion: "Новое AI-описание"
    })

    render(<AiDescriptionActionHarness />)

    expect(screen.getByTestId("description-value").textContent).toBe(
      "Старое описание"
    )

    fireEvent.click(screen.getByRole("button", { name: "Улучшить описание" }))

    await waitFor(() => {
      expect(requestAiDescriptionMock).toHaveBeenCalledTimes(1)
    })

    await screen.findByRole("button", { name: "Применить" })

    expect(screen.getByTestId("description-value").textContent).toBe(
      "Старое описание"
    )

    fireEvent.click(screen.getByRole("button", { name: "Применить" }))

    await waitFor(() => {
      expect(screen.getByTestId("description-value").textContent).toBe(
        "Новое AI-описание"
      )
    })
  })

  it("should keep existing description when user dismisses AI suggestion", async () => {
    requestAiDescriptionMock.mockResolvedValue({
      suggestion: "Ещё одно AI-описание"
    })

    render(<AiDescriptionActionHarness />)

    fireEvent.click(screen.getByRole("button", { name: "Улучшить описание" }))

    fireEvent.click(await screen.findByRole("button", { name: "Закрыть" }))

    expect(screen.getByTestId("description-value").textContent).toBe(
      "Старое описание"
    )
  })

  it("should render result actions inside mobile sheet flow", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: createMatchMedia(true),
      writable: true
    })
    requestAiDescriptionMock.mockResolvedValue({
      suggestion: "AI-описание для mobile flow"
    })

    render(<AiDescriptionActionHarness />)

    fireEvent.click(screen.getByRole("button", { name: "Улучшить описание" }))

    expect(
      await screen.findByRole("heading", { name: "AI-улучшение описания" })
    ).toBeTruthy()
    expect(
      await screen.findByRole("button", { name: "Сравнить изменения" })
    ).toBeTruthy()
  })
})

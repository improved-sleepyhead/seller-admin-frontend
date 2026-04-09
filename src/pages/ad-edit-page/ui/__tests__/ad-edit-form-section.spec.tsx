/* @vitest-environment jsdom */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react"
import {
  type ComponentProps,
  type ReactElement,
  useEffect,
  useState
} from "react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
  return {
    requestAiDescriptionMock: vi.fn(),
    requestAiPriceMock: vi.fn(),
    submitPayloadMock: vi.fn()
  }
})

vi.mock("@/entities/ad/api", async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>("@/entities/ad/api")

  return {
    ...actual,
    requestAiDescription: mocks.requestAiDescriptionMock,
    requestAiPrice: mocks.requestAiPriceMock
  }
})

import type { AdDetailsDto } from "@/entities/ad/api"
import { type AdEditFormValues, toItemPatch } from "@/entities/ad/model"

import { AdEditFooterActions } from "../ad-edit-footer-actions"
import { AdEditFormSection } from "../ad-edit-form-section"

const TIMESTAMP = "2026-04-10T10:00:00.000Z"

const AD_DETAILS: Extract<AdDetailsDto, { category: "electronics" }> = {
  category: "electronics",
  createdAt: TIMESTAMP,
  description: "Серверное описание",
  id: 7,
  params: {
    brand: "Apple",
    color: "Black",
    condition: "used",
    model: "MacBook Pro",
    type: "laptop"
  },
  price: 120000,
  title: "MacBook Pro",
  updatedAt: TIMESTAMP
}

type AdEditFormSectionProps = ComponentProps<typeof AdEditFormSection>

const AI_STATE: AdEditFormSectionProps["ai"] = {
  badgeVariant: "default",
  chatEnabled: true,
  descriptionEnabled: true,
  label: "AI доступен",
  message: "Все AI-инструменты доступны.",
  model: "gpt-4.1-mini",
  priceEnabled: true
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

interface HarnessProps {
  onSubmitPayload?: (payload: ReturnType<typeof toItemPatch>) => void
}

function AdEditPageFormHarness({ onSubmitPayload }: HarnessProps) {
  const [form, setForm] = useState<AdEditFormSectionProps["form"]>(null)

  useEffect(() => {
    if (form === null) {
      return
    }

    void form.trigger()
  }, [form])

  return (
    <div>
      <AdEditFormSection
        ad={AD_DETAILS}
        ai={AI_STATE}
        draftSavedAt={null}
        form={form}
        onCategoryChangeRequest={() => undefined}
        onFormReady={setForm}
        onSubmit={(values: AdEditFormValues) => {
          onSubmitPayload?.(toItemPatch(values))
          return Promise.resolve()
        }}
        savePending={false}
      />
      <AdEditFooterActions adId={AD_DETAILS.id} savePending={false} />
    </div>
  )
}

function renderEditPageForm(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false
      },
      queries: {
        retry: false
      }
    }
  })

  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MemoryRouter>
    )
  })
}

describe("AdEditFormSection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: createMatchMedia(),
      writable: true
    })
    mocks.requestAiDescriptionMock.mockResolvedValue({
      suggestion: "AI-описание"
    })
    mocks.requestAiPriceMock.mockResolvedValue({
      currency: "RUB",
      reasoning: "Рыночная цена",
      suggestedPrice: 140000
    })
  })

  afterEach(() => {
    cleanup()
  })

  it("should send full current form payload for AI description on edit page", async () => {
    renderEditPageForm(<AdEditPageFormHarness />)

    fireEvent.change(screen.getByLabelText("Заголовок"), {
      target: { value: "MacBook Air 13" }
    })

    await waitFor(() => {
      expect(
        screen
          .getByRole("button", { name: "Улучшить описание" })
          .getAttribute("disabled")
      ).toBeNull()
    })

    fireEvent.click(screen.getByRole("button", { name: "Улучшить описание" }))

    await waitFor(() => {
      expect(mocks.requestAiDescriptionMock).toHaveBeenCalledTimes(1)
    })

    expect(mocks.requestAiDescriptionMock.mock.calls[0]?.[0]).toEqual({
      category: "electronics",
      description: "Серверное описание",
      params: {
        brand: "Apple",
        color: "Black",
        condition: "used",
        model: "MacBook Pro",
        type: "laptop"
      },
      price: 120000,
      title: "MacBook Air 13"
    })
  })

  it("should send full current form payload for AI price on edit page", async () => {
    renderEditPageForm(<AdEditPageFormHarness />)

    fireEvent.change(screen.getByLabelText("Описание"), {
      target: { value: "Обновлённое описание для AI цены" }
    })

    await waitFor(() => {
      expect(
        screen
          .getByRole("button", { name: "Предложить цену" })
          .getAttribute("disabled")
      ).toBeNull()
    })

    fireEvent.click(screen.getByRole("button", { name: "Предложить цену" }))

    await waitFor(() => {
      expect(mocks.requestAiPriceMock).toHaveBeenCalledTimes(1)
    })

    expect(mocks.requestAiPriceMock.mock.calls[0]?.[0]).toEqual({
      category: "electronics",
      description: "Обновлённое описание для AI цены",
      params: {
        brand: "Apple",
        color: "Black",
        condition: "used",
        model: "MacBook Pro",
        type: "laptop"
      },
      price: 120000,
      title: "MacBook Pro"
    })
  })

  it("should block AI request when required category field is empty", async () => {
    renderEditPageForm(<AdEditPageFormHarness />)

    fireEvent.change(screen.getByLabelText("Бренд"), {
      target: { value: "" }
    })
    fireEvent.blur(screen.getByLabelText("Бренд"))

    fireEvent.click(screen.getByRole("button", { name: "Улучшить описание" }))

    await waitFor(() => {
      expect(mocks.requestAiDescriptionMock).not.toHaveBeenCalled()
    })

    expect(screen.getByText("Заполните обязательное поле")).not.toBeNull()
  })

  it("should submit partial save payload from edit page form", async () => {
    renderEditPageForm(
      <AdEditPageFormHarness onSubmitPayload={mocks.submitPayloadMock} />
    )

    fireEvent.change(screen.getByLabelText("Бренд"), {
      target: { value: "" }
    })
    fireEvent.change(screen.getByLabelText("Цвет"), {
      target: { value: "" }
    })

    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }))

    await waitFor(() => {
      expect(mocks.submitPayloadMock).toHaveBeenCalledTimes(1)
    })

    expect(mocks.submitPayloadMock).toHaveBeenCalledWith({
      category: "electronics",
      description: "Серверное описание",
      params: {
        brand: undefined,
        color: undefined,
        condition: "used",
        model: "MacBook Pro",
        type: "laptop"
      },
      price: 120000,
      title: "MacBook Pro"
    })
  })

  it("should submit full save payload from edit page form", async () => {
    renderEditPageForm(
      <AdEditPageFormHarness onSubmitPayload={mocks.submitPayloadMock} />
    )

    fireEvent.change(screen.getByLabelText("Заголовок"), {
      target: { value: "  Обновлённый MacBook  " }
    })
    fireEvent.change(screen.getByLabelText("Цена"), {
      target: { value: "150000" }
    })

    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }))

    await waitFor(() => {
      expect(mocks.submitPayloadMock).toHaveBeenCalledTimes(1)
    })

    expect(mocks.submitPayloadMock).toHaveBeenCalledWith({
      category: "electronics",
      description: "Серверное описание",
      params: {
        brand: "Apple",
        color: "Black",
        condition: "used",
        model: "MacBook Pro",
        type: "laptop"
      },
      price: 150000,
      title: "Обновлённый MacBook"
    })
  })
})

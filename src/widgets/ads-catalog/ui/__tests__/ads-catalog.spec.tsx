/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { AdsListItemVM } from "@/entities/ad/api"
import type { AdsListNavigationState } from "@/entities/ad-list"

import { AdsCatalog, AdsErrorState } from "../ads-catalog"

import type { ReactElement } from "react"

const ADS: AdsListItemVM[] = [
  {
    categoryLabel: "Электроника",
    id: 1,
    missingFields: [],
    needsRevision: false,
    previewImageSrc: null,
    priceLabel: "120 000 ₽",
    title: "MacBook Pro"
  },
  {
    categoryLabel: "Авто",
    id: 2,
    missingFields: ["Бренд"],
    needsRevision: true,
    previewImageSrc: null,
    priceLabel: "900 000 ₽",
    title: "Toyota Corolla"
  }
]

const NAVIGATION_STATE: AdsListNavigationState = {
  adsSearch: "?q=test"
}

function renderWithRouter(ui: ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>
  })
}

describe("AdsCatalog", () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  afterEach(() => {
    cleanup()
  })

  it("should render ad links for grid and list layouts", () => {
    const { rerender } = renderWithRouter(
      <AdsCatalog ads={ADS} layout="grid" navigationState={NAVIGATION_STATE} />
    )

    expect(
      screen.getByRole("link", { name: /MacBook Pro/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /Toyota Corolla/i })
    ).toHaveAttribute("href", "/ads/2")

    rerender(
      <AdsCatalog ads={ADS} layout="list" navigationState={NAVIGATION_STATE} />
    )

    expect(screen.getAllByRole("link")).toHaveLength(2)
    expect(screen.getByText("Требует доработок")).toBeInTheDocument()
  })

  it("should render retry action for catalog error state", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    renderWithRouter(
      <AdsErrorState message="Сервис недоступен" onRetry={onRetry} />
    )

    await user.click(screen.getByRole("button", { name: "Повторить" }))

    expect(screen.getByText("Сервис недоступен")).toBeInTheDocument()
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

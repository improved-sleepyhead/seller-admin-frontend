/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  AdEditErrorState,
  AdEditLayout,
  AdEditNotFoundState
} from "../ad-edit-layout"

import type { ReactElement } from "react"

function renderWithRouter(ui: ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>
  })
}

describe("AdEditLayout", () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  afterEach(() => {
    cleanup()
  })

  it("should compose form, footer and ai areas", () => {
    renderWithRouter(
      <AdEditLayout
        aiArea={<div>AI зона</div>}
        footer={<button type="button">Сохранить</button>}
        formArea={<div>Форма объявления</div>}
      />
    )

    expect(screen.getByText("Форма объявления")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Сохранить" })
    ).toBeInTheDocument()
    expect(screen.getByText("AI зона")).toBeInTheDocument()
  })

  it("should render not-found and error states with actions", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    const { rerender } = renderWithRouter(
      <AdEditNotFoundState backHref="/ads?q=macbook" />
    )

    expect(screen.getByText("Объявление не найдено")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Вернуться к списку" })
    ).toBeInTheDocument()

    rerender(
      <AdEditErrorState
        backHref="/ads"
        message="Ошибка загрузки"
        onRetry={onRetry}
      />
    )

    await user.click(screen.getByRole("button", { name: "Повторить" }))

    expect(screen.getByText("Ошибка загрузки")).toBeInTheDocument()
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

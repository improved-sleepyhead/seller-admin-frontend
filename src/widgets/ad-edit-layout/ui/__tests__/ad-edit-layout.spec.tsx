/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
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

    expect(screen.getByText("Форма объявления")).not.toBeNull()
    expect(screen.getByRole("button", { name: "Сохранить" })).not.toBeNull()
    expect(screen.getByText("AI зона")).not.toBeNull()
  })

  it("should render not-found and error states with actions", () => {
    const onRetry = vi.fn()

    const { rerender } = renderWithRouter(
      <AdEditNotFoundState backHref="/ads?q=macbook" />
    )

    expect(screen.getByText("Объявление не найдено")).not.toBeNull()
    expect(
      screen.getByRole("link", { name: "Вернуться к списку" })
    ).not.toBeNull()

    rerender(
      <AdEditErrorState
        backHref="/ads"
        message="Ошибка загрузки"
        onRetry={onRetry}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Повторить" }))

    expect(screen.getByText("Ошибка загрузки")).not.toBeNull()
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

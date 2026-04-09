/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AdImage } from "../ad-image"

describe("AdImage", () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  afterEach(() => {
    cleanup()
  })

  it("should render placeholder when src is empty", () => {
    render(<AdImage src="" alt="Объявление" />)

    expect(screen.getByText("Нет изображения")).toBeInTheDocument()
  })

  it("should render placeholder when image loading fails", () => {
    render(<AdImage src="https://example.com/broken.jpg" alt="Объявление" />)

    const image = screen.getByRole("img", { name: "Объявление" })
    expect(image).toBeInTheDocument()
    expect(screen.queryByText("Нет изображения")).not.toBeInTheDocument()

    fireEvent.error(image)

    expect(screen.getByText("Нет изображения")).toBeInTheDocument()
    expect(
      screen.queryByRole("img", { name: "Объявление" })
    ).not.toBeInTheDocument()
  })
})

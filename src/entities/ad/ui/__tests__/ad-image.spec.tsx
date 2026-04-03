/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { AdImage } from "../ad-image"

describe("AdImage", () => {
  afterEach(() => {
    cleanup()
  })

  it("should render placeholder when src is empty", () => {
    render(<AdImage src="" alt="Объявление" />)

    expect(screen.queryByText("Нет изображения")).not.toBeNull()
  })

  it("should render placeholder when image loading fails", () => {
    render(<AdImage src="https://example.com/broken.jpg" alt="Объявление" />)

    const image = screen.getByRole("img", { name: "Объявление" })
    expect(image).not.toBeNull()
    expect(screen.queryByText("Нет изображения")).toBeNull()

    fireEvent.error(image)

    expect(screen.queryByText("Нет изображения")).not.toBeNull()
    expect(screen.queryByRole("img", { name: "Объявление" })).toBeNull()
  })
})

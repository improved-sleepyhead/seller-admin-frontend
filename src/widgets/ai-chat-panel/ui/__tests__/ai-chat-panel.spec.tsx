/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AiChatPanel } from "../ai-chat-panel"

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => {
      return {
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches,
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn()
      }
    }),
    writable: true
  })
}

describe("AiChatPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it("should render desktop card layout when viewport is not mobile", () => {
    mockMatchMedia(false)

    render(
      <AiChatPanel disabled={false} statusContent={<p>AI доступен</p>}>
        <div>Содержимое чата</div>
      </AiChatPanel>
    )

    expect(screen.queryByRole("button", { name: "Открыть AI чат" })).toBeNull()
    expect(screen.queryByText("AI чат")).not.toBeNull()
    expect(screen.queryByText("AI доступен")).not.toBeNull()
    expect(screen.queryByText("Содержимое чата")).not.toBeNull()
  })

  it("should open mobile sheet only after explicit trigger", async () => {
    mockMatchMedia(true)

    render(
      <AiChatPanel disabled={false} statusContent={<p>AI доступен</p>}>
        <div>Содержимое чата</div>
      </AiChatPanel>
    )

    const openButton = screen.getByRole("button", { name: "Открыть AI чат" })

    expect(screen.queryByText("Содержимое чата")).toBeNull()

    fireEvent.click(openButton)

    expect(await screen.findByText("Содержимое чата")).not.toBeNull()
    expect(
      screen.queryByText("Диалог сохраняется локально для текущего объявления.")
    ).not.toBeNull()
  })

  it("should keep mobile trigger disabled when chat is unavailable", () => {
    mockMatchMedia(true)

    render(
      <AiChatPanel disabled={true}>
        <div>Содержимое чата</div>
      </AiChatPanel>
    )

    const openButton = screen.getByRole("button", {
      name: "Открыть AI чат"
    })

    expect(openButton.getAttribute("disabled")).not.toBeNull()
  })
})

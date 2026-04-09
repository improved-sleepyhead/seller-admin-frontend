/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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
    vi.useRealTimers()
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

    expect(
      screen.queryByRole("button", { name: "Открыть AI чат" })
    ).not.toBeInTheDocument()
    expect(screen.getByText("AI чат")).toBeInTheDocument()
    expect(screen.getByText("AI доступен")).toBeInTheDocument()
    expect(screen.getByText("Содержимое чата")).toBeInTheDocument()
  })

  it("should open mobile sheet only after explicit trigger", async () => {
    const user = userEvent.setup()

    mockMatchMedia(true)

    render(
      <AiChatPanel disabled={false} statusContent={<p>AI доступен</p>}>
        <div>Содержимое чата</div>
      </AiChatPanel>
    )

    const openButton = screen.getByRole("button", { name: "Открыть AI чат" })

    expect(screen.queryByText("Содержимое чата")).not.toBeInTheDocument()

    await user.click(openButton)

    expect(await screen.findByText("Содержимое чата")).toBeInTheDocument()
    expect(
      screen.queryByText("Диалог сохраняется локально для текущего объявления.")
    ).toBeInTheDocument()
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

    expect(openButton).toBeDisabled()
  })
})

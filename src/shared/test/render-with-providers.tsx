import { QueryClientProvider } from "@tanstack/react-query"
import { render, type RenderOptions } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

import { createTestQueryClient } from "./create-test-query-client"

import type { QueryClient } from "@tanstack/react-query"
import type { PropsWithChildren, ReactElement } from "react"

interface TestProvidersOptions {
  initialEntries?: string[]
  queryClient?: QueryClient
}

interface RenderWithProvidersOptions
  extends Omit<RenderOptions, "queries" | "wrapper">, TestProvidersOptions {}

export function createTestProvidersWrapper({
  initialEntries = ["/"],
  queryClient = createTestQueryClient()
}: TestProvidersOptions = {}) {
  function TestProviders({ children }: PropsWithChildren) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  return {
    queryClient,
    wrapper: TestProviders
  }
}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
) {
  const {
    initialEntries,
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = options
  const { wrapper } = createTestProvidersWrapper({
    initialEntries,
    queryClient
  })

  return {
    queryClient,
    ...render(ui, {
      wrapper,
      ...renderOptions
    })
  }
}

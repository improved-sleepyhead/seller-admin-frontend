import { createBrowserRouter, Outlet } from "react-router-dom"

import { PageLoader } from "@/shared/ui/page-state"
import { ThemeToggle } from "@/shared/ui/theme"

import { RootRedirect } from "./redirects"
import { ROUTE_PATHS } from "./route-paths"

import type { PropsWithChildren } from "react"

function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="flex justify-end px-4 py-2">
        <ThemeToggle />
      </header>

      <main className="px-4 pb-6">{children}</main>
    </div>
  )
}

function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

function RootHydrateFallback() {
  return (
    <AppShell>
      <PageLoader />
    </AppShell>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    HydrateFallback: RootHydrateFallback,
    children: [
      {
        index: true,
        element: <RootRedirect />
      },
      {
        path: ROUTE_PATHS.ads,
        lazy: () => import("@/pages/ads-list-page")
      },
      {
        path: ROUTE_PATHS.adView,
        lazy: () => import("@/pages/ad-view-page")
      },
      {
        path: ROUTE_PATHS.adEdit,
        lazy: () => import("@/pages/ad-edit-page")
      }
    ]
  }
])

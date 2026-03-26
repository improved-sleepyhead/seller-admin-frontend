import { createBrowserRouter, Outlet } from "react-router-dom"

import { ThemeToggle } from "@/shared/ui/theme"

import { RootRedirect } from "./redirects"
import { ROUTE_PATHS } from "./route-paths"

function RootLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="flex justify-end p-4">
        <ThemeToggle />
      </header>

      <main className="px-4 pb-6">
        <Outlet />
      </main>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
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

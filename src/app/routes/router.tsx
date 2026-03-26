import { createBrowserRouter, Outlet } from "react-router-dom"

import { RootRedirect } from "./redirects"
import { ROUTE_PATHS } from "./route-paths"

function RootLayout() {
  return <Outlet />
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

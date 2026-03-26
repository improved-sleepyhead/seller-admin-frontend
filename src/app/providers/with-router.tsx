import { RouterProvider } from "react-router-dom"

import { router } from "@/app/routes"

export function WithRouter() {
  return <RouterProvider router={router} />
}

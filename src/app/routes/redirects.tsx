import { Navigate } from "react-router-dom"

import { ROUTE_PATHS } from "./route-paths"

export function RootRedirect() {
  return <Navigate to={ROUTE_PATHS.ads} replace />
}

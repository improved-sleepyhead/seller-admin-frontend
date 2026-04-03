import { WithQueryClient } from "./with-query-client"
import { WithRouter } from "./with-router"
import { WithSonner } from "./with-sonner"
import { WithTheme } from "./with-theme"

export function AppProviders() {
  return (
    <WithTheme>
      <WithQueryClient>
        <WithSonner>
          <WithRouter />
        </WithSonner>
      </WithQueryClient>
    </WithTheme>
  )
}

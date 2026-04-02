import { useAdViewPageModel } from "../model"
import { AdViewPageScreen } from "./ad-view-page-screen"

export function AdViewPage() {
  const model = useAdViewPageModel()

  return <AdViewPageScreen model={model} />
}

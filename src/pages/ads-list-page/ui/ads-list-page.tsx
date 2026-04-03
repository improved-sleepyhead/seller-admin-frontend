import { useAdsListPageModel } from "../model"
import { AdsListPageScreen } from "./ads-list-page-screen"

export function AdsListPage() {
  const model = useAdsListPageModel()

  return <AdsListPageScreen model={model} />
}

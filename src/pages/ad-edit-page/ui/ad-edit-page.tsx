import { useAdEditPageModel } from "../model"
import { AdEditPageScreen } from "./ad-edit-page-screen"

export function AdEditPage() {
  const model = useAdEditPageModel()

  return <AdEditPageScreen model={model} />
}

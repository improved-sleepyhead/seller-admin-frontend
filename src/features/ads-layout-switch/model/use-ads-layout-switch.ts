import type { AdsLayout } from "@/entities/ad/api"
import { useAdsListState } from "@/entities/ad/model"

interface UseAdsLayoutSwitchResult {
  activeLayout: AdsLayout
  setLayout: (nextLayout: AdsLayout) => void
}

export function useAdsLayoutSwitch(): UseAdsLayoutSwitchResult {
  const activeLayout = useAdsListState(state => state.layout)
  const setLayout = useAdsListState(state => state.setLayout)

  return {
    activeLayout,
    setLayout
  }
}

import { type AdsLayout, useAdsListState } from "@/entities/ad"

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

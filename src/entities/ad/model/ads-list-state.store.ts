import { createStore, type StoreApi, useStore } from "zustand"

/* eslint-disable import/no-internal-modules */
import {
  AD_CATEGORIES,
  type AdCategory,
  type AdSortColumn,
  type AdSortDirection
} from "../api/ad.contracts"
import {
  ADS_LIST_DEFAULT_URL_PARAMS,
  areAdsListUrlParamsEqual,
  createAdsSearchParams,
  parseAdsSearchParams,
  type AdsLayout,
  type AdsListUrlParams
} from "../api/ad.search-params"
/* eslint-enable import/no-internal-modules */

export interface AdsListState extends AdsListUrlParams {
  setSearch: (nextSearch: string) => void
  setCategories: (categories: AdCategory[]) => void
  setNeedsRevision: (nextValue: boolean) => void
  setSort: (nextSort: {
    sortColumn: AdSortColumn
    sortDirection: AdSortDirection
  }) => void
  setLayout: (nextLayout: AdsLayout) => void
  setPage: (nextPage: number) => void
  resetFilters: () => void
  hydrateFromUrl: (nextParams: AdsListUrlParams) => void
}

type AdsListStateStoreApi = StoreApi<AdsListState>

function createInitialUrlParams(): AdsListUrlParams {
  return {
    ...ADS_LIST_DEFAULT_URL_PARAMS,
    categories: [...ADS_LIST_DEFAULT_URL_PARAMS.categories]
  }
}

function selectUrlParams(state: AdsListState): AdsListUrlParams {
  return {
    categories: [...state.categories],
    layout: state.layout,
    needsRevision: state.needsRevision,
    page: state.page,
    q: state.q,
    sortColumn: state.sortColumn,
    sortDirection: state.sortDirection
  }
}

function normalizeCategories(categories: AdCategory[]): AdCategory[] {
  const selected = new Set(categories)
  return AD_CATEGORIES.filter(category => selected.has(category))
}

function normalizeUrlParams(params: AdsListUrlParams): AdsListUrlParams {
  return parseAdsSearchParams(createAdsSearchParams(params))
}

function setUrlParamsIfChanged(
  setState: AdsListStateStoreApi["setState"],
  getState: AdsListStateStoreApi["getState"],
  nextParams: AdsListUrlParams
): void {
  const normalizedNextParams = normalizeUrlParams(nextParams)
  const currentParams = selectUrlParams(getState())

  if (areAdsListUrlParamsEqual(currentParams, normalizedNextParams)) {
    return
  }

  setState(normalizedNextParams)
}

function createAdsListStateStore(): AdsListStateStoreApi {
  return createStore<AdsListState>((set, get) => ({
    ...createInitialUrlParams(),
    hydrateFromUrl: nextParams => {
      setUrlParamsIfChanged(set, get, nextParams)
    },
    resetFilters: () => {
      setUrlParamsIfChanged(set, get, createInitialUrlParams())
    },
    setCategories: categories => {
      const state = get()

      setUrlParamsIfChanged(set, get, {
        ...selectUrlParams(state),
        categories: normalizeCategories(categories),
        page: ADS_LIST_DEFAULT_URL_PARAMS.page
      })
    },
    setLayout: nextLayout => {
      const state = get()

      setUrlParamsIfChanged(set, get, {
        ...selectUrlParams(state),
        layout: nextLayout
      })
    },
    setNeedsRevision: nextValue => {
      const state = get()

      setUrlParamsIfChanged(set, get, {
        ...selectUrlParams(state),
        needsRevision: nextValue,
        page: ADS_LIST_DEFAULT_URL_PARAMS.page
      })
    },
    setPage: nextPage => {
      const state = get()

      setUrlParamsIfChanged(set, get, {
        ...selectUrlParams(state),
        page: nextPage
      })
    },
    setSearch: nextSearch => {
      const state = get()

      setUrlParamsIfChanged(set, get, {
        ...selectUrlParams(state),
        page: ADS_LIST_DEFAULT_URL_PARAMS.page,
        q: nextSearch
      })
    },
    setSort: nextSort => {
      const state = get()

      setUrlParamsIfChanged(set, get, {
        ...selectUrlParams(state),
        page: ADS_LIST_DEFAULT_URL_PARAMS.page,
        sortColumn: nextSort.sortColumn,
        sortDirection: nextSort.sortDirection
      })
    }
  }))
}

// This store is intentionally module-scoped and session-only.
// URL search params are the persistence layer for list state, so a full reload
// should rehydrate from the URL rather than from in-memory store persistence.
const adsListStateStore = createAdsListStateStore()

export function useAdsListState<Selected>(
  selector: (state: AdsListState) => Selected
): Selected {
  return useStore(adsListStateStore, selector)
}

export function getAdsListUrlParamsFromState(): AdsListUrlParams {
  return selectUrlParams(adsListStateStore.getState())
}

export function hydrateAdsListStateFromUrl(nextParams: AdsListUrlParams): void {
  adsListStateStore.getState().hydrateFromUrl(nextParams)
}

export function subscribeToAdsListState(listener: () => void): () => void {
  return adsListStateStore.subscribe(listener)
}

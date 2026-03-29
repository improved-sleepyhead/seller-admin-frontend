/* @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react"
import { useForm } from "react-hook-form"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { AdDetailsDto, AdDraft, AdEditFormValues } from "@/entities/ad"
import { draftRegistryStore } from "@/shared/lib/draft-registry-store"

import { getAdDraftStorageKey, useAdDraft } from "../../model"
import { DraftRestoreDialog } from "../draft-restore-dialog"

const TIMESTAMP = "2026-03-30T00:00:00.000Z"

type ElectronicsAdDetails = Extract<AdDetailsDto, { category: "electronics" }>

function createAd(itemId: number): ElectronicsAdDetails {
  return {
    category: "electronics",
    createdAt: TIMESTAMP,
    description: "Серверное описание",
    id: itemId,
    params: {
      brand: "Apple",
      color: "Black",
      condition: "used",
      model: "MacBook Pro",
      type: "laptop"
    },
    price: 120000,
    title: "Серверный заголовок",
    updatedAt: TIMESTAMP
  }
}

function toFormValues(ad: ElectronicsAdDetails): AdEditFormValues {
  return {
    category: ad.category,
    description: ad.description ?? "",
    params: {
      brand: ad.params.brand ?? "",
      color: ad.params.color ?? "",
      condition: ad.params.condition ?? "",
      model: ad.params.model ?? "",
      type: ad.params.type ?? ""
    },
    price: ad.price,
    title: ad.title
  }
}

function createDraft(
  itemId: number,
  overrides: Partial<AdDraft["form"]> = {}
): AdDraft {
  const ad = createAd(itemId)

  return {
    form: {
      ...toFormValues(ad),
      ...overrides
    },
    itemId,
    savedAt: "2026-03-30T10:00:00.000Z",
    serverHash: `${itemId}:${TIMESTAMP}`
  }
}

interface DraftFlowHarnessProps {
  ad: ElectronicsAdDetails
  entryRevision?: number
  itemId: number
}

function DraftFlowHarness({
  ad,
  entryRevision = 1,
  itemId
}: DraftFlowHarnessProps) {
  const form = useForm<AdEditFormValues>({
    defaultValues: toFormValues(ad)
  })
  const { isRestoreDialogOpen, restoreDraft, useServerVersion } = useAdDraft({
    ad,
    entryRevision,
    form,
    itemId
  })

  return (
    <div>
      <div data-testid="title-value">{form.watch("title")}</div>
      <button
        type="button"
        onClick={() =>
          form.setValue("title", "Изменённый заголовок", { shouldDirty: true })
        }
      >
        Изменить заголовок
      </button>
      <DraftRestoreDialog
        open={isRestoreDialogOpen}
        onRestoreDraft={restoreDraft}
        onUseServerVersion={useServerVersion}
      />
    </div>
  )
}

describe("Draft restore flow", () => {
  beforeEach(() => {
    vi.useRealTimers()
    window.localStorage.clear()
    window.sessionStorage.clear()
    draftRegistryStore.setState({ drafts: {} })
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it("should render restore dialog when draft exists in localStorage", async () => {
    const itemId = 101
    window.localStorage.setItem(
      getAdDraftStorageKey(itemId),
      JSON.stringify(createDraft(itemId, { title: "Черновик" }))
    )

    render(<DraftFlowHarness ad={createAd(itemId)} itemId={itemId} />)

    await screen.findByText("Найден локальный черновик")
  })

  it("should restore form values when user clicks restore draft", async () => {
    const itemId = 102
    window.localStorage.setItem(
      getAdDraftStorageKey(itemId),
      JSON.stringify(createDraft(itemId, { title: "Заголовок из черновика" }))
    )

    render(<DraftFlowHarness ad={createAd(itemId)} itemId={itemId} />)

    fireEvent.click(await screen.findByText("Восстановить черновик"))

    await waitFor(() => {
      expect(screen.getByTestId("title-value").textContent).toBe(
        "Заголовок из черновика"
      )
    })
  })

  it("should remove draft when user opens server version", async () => {
    const itemId = 103
    const storageKey = getAdDraftStorageKey(itemId)

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(createDraft(itemId, { title: "Черновой заголовок" }))
    )

    render(<DraftFlowHarness ad={createAd(itemId)} itemId={itemId} />)

    fireEvent.click(await screen.findByText("Открыть актуальную версию"))

    await waitFor(() => {
      expect(window.localStorage.getItem(storageKey)).toBeNull()
    })
  })

  it("should autosave form values to localStorage after debounce", () => {
    const itemId = 104
    const storageKey = getAdDraftStorageKey(itemId)

    vi.useFakeTimers()
    render(<DraftFlowHarness ad={createAd(itemId)} itemId={itemId} />)
    fireEvent.click(screen.getByText("Изменить заголовок"))

    act(() => {
      vi.advanceTimersByTime(699)
    })
    expect(window.localStorage.getItem(storageKey)).toBeNull()

    act(() => {
      vi.advanceTimersByTime(1)
    })

    const rawDraft = window.localStorage.getItem(storageKey)
    expect(rawDraft).not.toBeNull()

    const savedDraft = JSON.parse(rawDraft!) as AdDraft
    expect(savedDraft.form.title).toBe("Изменённый заголовок")
  })
})

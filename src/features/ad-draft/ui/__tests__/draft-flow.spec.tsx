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
import { adDraftStateStore } from "@/features/ad-draft/model/ad-draft-state.store"
import { getAdDraftStorageKey } from "@/features/ad-draft/model/draft-keys"
import { useAdDraft } from "@/features/ad-draft/model/use-ad-draft"
import { draftRegistryStore } from "@/shared/lib/draft-registry-store"

import { DraftRestoreDialog } from "../draft-restore-dialog"

const TIMESTAMP = "2026-03-30T00:00:00.000Z"
const ITEM_ID = 1

function createAd(): AdDetailsDto {
  return {
    category: "electronics",
    createdAt: TIMESTAMP,
    description: "Серверное описание",
    id: ITEM_ID,
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

function toFormValues(ad: AdDetailsDto): AdEditFormValues {
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

function createDraft(overrides: Partial<AdDraft["form"]> = {}): AdDraft {
  const ad = createAd()
  return {
    form: {
      ...toFormValues(ad),
      ...overrides
    },
    itemId: ITEM_ID,
    savedAt: "2026-03-30T10:00:00.000Z",
    serverHash: `${ITEM_ID}:${TIMESTAMP}`
  }
}

interface DraftFlowHarnessProps {
  ad: AdDetailsDto
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
    adDraftStateStore.setState({ byItemId: {} })
    draftRegistryStore.setState({ drafts: {} })
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it("should render restore dialog when draft exists in localStorage", async () => {
    window.localStorage.setItem(
      getAdDraftStorageKey(ITEM_ID),
      JSON.stringify(createDraft({ title: "Черновик" }))
    )

    render(<DraftFlowHarness ad={createAd()} itemId={ITEM_ID} />)

    await waitFor(() => {
      expect(screen.getByText("Найден локальный черновик")).not.toBeNull()
    })
  })

  it("should restore form values when user clicks restore draft", async () => {
    window.localStorage.setItem(
      getAdDraftStorageKey(ITEM_ID),
      JSON.stringify(createDraft({ title: "Заголовок из черновика" }))
    )

    render(<DraftFlowHarness ad={createAd()} itemId={ITEM_ID} />)

    await screen.findByText("Восстановить черновик")
    fireEvent.click(screen.getByText("Восстановить черновик"))

    await waitFor(() => {
      expect(screen.getByTestId("title-value").textContent).toBe(
        "Заголовок из черновика"
      )
    })
  })

  it("should remove draft when user opens server version", async () => {
    const storageKey = getAdDraftStorageKey(ITEM_ID)
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(createDraft({ title: "Черновой заголовок" }))
    )

    render(<DraftFlowHarness ad={createAd()} itemId={ITEM_ID} />)

    await screen.findByText("Открыть актуальную версию")
    fireEvent.click(screen.getByText("Открыть актуальную версию"))

    await waitFor(() => {
      expect(window.localStorage.getItem(storageKey)).toBeNull()
    })
  })

  it("should autosave form values to localStorage after debounce", async () => {
    vi.useFakeTimers()
    const storageKey = getAdDraftStorageKey(ITEM_ID)
    render(<DraftFlowHarness ad={createAd()} itemId={ITEM_ID} />)

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

    const savedDraft = JSON.parse(rawDraft as string) as AdDraft
    expect(savedDraft.form.title).toBe("Изменённый заголовок")

  })
})

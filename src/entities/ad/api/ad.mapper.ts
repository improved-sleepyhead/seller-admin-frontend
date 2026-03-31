import {
  AD_CATEGORY_LABELS,
  doesNeedRevision,
  getFilledSpecs,
  getMissingFields
} from "../model"

import type { Ad, FilledSpec } from "../model"
import type { AdDetailsDto, AdListItemDto } from "./ad.contracts"

const priceFormatter = new Intl.NumberFormat("ru-RU", {
  currency: "RUB",
  maximumFractionDigits: 0,
  style: "currency"
})

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
})

export interface AdsListItemVM {
  id: number
  title: string
  priceLabel: string
  categoryLabel: string
  previewImageSrc: string | null
  needsRevision: boolean
  missingFields: string[]
}

export interface AdDetailsVM {
  id: number
  title: string
  priceLabel: string
  createdAtLabel: string
  updatedAtLabel: string
  images: string[]
  filledSpecs: FilledSpec[]
  descriptionText: string
  needsRevision: boolean
  missingFields: string[]
}

function formatDateLabel(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return dateFormatter.format(date)
}

function normalizeDescription(description: string | undefined): string {
  if (typeof description !== "string") {
    return "Описание отсутствует"
  }

  const normalized = description.trim()
  return normalized.length > 0 ? normalized : "Описание отсутствует"
}

function toDomainAd(dto: AdDetailsDto): Ad {
  return {
    ...dto,
    previewImage: dto.previewImage ?? null
  } as Ad
}

export function mapToListItemVM(dto: AdListItemDto): AdsListItemVM {
  const ad = toDomainAd(dto)

  return {
    categoryLabel: AD_CATEGORY_LABELS[dto.category],
    id: dto.id,
    missingFields: getMissingFields(ad),
    needsRevision: doesNeedRevision(ad),
    previewImageSrc: dto.previewImage ?? null,
    priceLabel: priceFormatter.format(dto.price),
    title: dto.title
  }
}

export function mapToDetailsVM(dto: AdDetailsDto): AdDetailsVM {
  const ad = toDomainAd(dto)

  return {
    createdAtLabel: formatDateLabel(dto.createdAt),
    descriptionText: normalizeDescription(dto.description),
    filledSpecs: getFilledSpecs(ad),
    id: dto.id,
    images: dto.images ?? [],
    missingFields: getMissingFields(ad),
    needsRevision: doesNeedRevision(ad),
    priceLabel: priceFormatter.format(dto.price),
    title: dto.title,
    updatedAtLabel: formatDateLabel(dto.updatedAt)
  }
}

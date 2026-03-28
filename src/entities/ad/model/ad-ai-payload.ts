import { ItemUpdateInSchema, type ItemUpdateIn } from "../api"
import { AD_REQUIRED_PARAM_KEYS_BY_CATEGORY } from "./ad.constants"

import type { AdEditFormValues } from "./ad.types"
import type { Path, UseFormReturn } from "react-hook-form"

type AdEditFormApi = UseFormReturn<AdEditFormValues, unknown, AdEditFormValues>
type AdEditFormPath = Path<AdEditFormValues>

interface EnsureValidAiPayloadSuccess {
  isValid: true
  payload: ItemUpdateIn
}

interface EnsureValidAiPayloadFailure {
  isValid: false
}

type EnsureValidAiPayloadResult =
  | EnsureValidAiPayloadSuccess
  | EnsureValidAiPayloadFailure

const NUMERIC_FIELDS = new Set<AdEditFormPath>([
  "price",
  "params.yearOfManufacture",
  "params.mileage",
  "params.enginePower",
  "params.area",
  "params.floor"
])

const SELECT_FIELDS = new Set<AdEditFormPath>([
  "params.transmission",
  "params.type",
  "params.condition"
])

function toRequiredFieldPaths(
  category: AdEditFormValues["category"]
): AdEditFormPath[] {
  const categoryFieldPaths = AD_REQUIRED_PARAM_KEYS_BY_CATEGORY[category].map(
    key => `params.${key}` as AdEditFormPath
  )

  return ["title", "price", ...categoryFieldPaths]
}

function toStrictTrimmedString(value: unknown): string {
  if (typeof value === "string") {
    return value.trim()
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  return ""
}

function toStrictNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : Number.NaN
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim()

    if (trimmedValue.length === 0) {
      return Number.NaN
    }

    const parsedValue = Number(trimmedValue)
    return Number.isFinite(parsedValue) ? parsedValue : Number.NaN
  }

  return Number.NaN
}

function toOptionalDescription(value: string): string | undefined {
  const trimmedValue = value.trim()

  return trimmedValue.length > 0 ? trimmedValue : undefined
}

function buildAiPayloadCandidate(values: AdEditFormValues): unknown {
  const basePayload = {
    title: values.title.trim(),
    description: toOptionalDescription(values.description),
    price: toStrictNumber(values.price)
  }

  if (values.category === "auto") {
    return {
      ...basePayload,
      category: "auto",
      params: {
        brand: toStrictTrimmedString(values.params.brand),
        model: toStrictTrimmedString(values.params.model),
        yearOfManufacture: toStrictNumber(values.params.yearOfManufacture),
        transmission: toStrictTrimmedString(values.params.transmission),
        mileage: toStrictNumber(values.params.mileage),
        enginePower: toStrictNumber(values.params.enginePower)
      }
    }
  }

  if (values.category === "real_estate") {
    return {
      ...basePayload,
      category: "real_estate",
      params: {
        type: toStrictTrimmedString(values.params.type),
        address: toStrictTrimmedString(values.params.address),
        area: toStrictNumber(values.params.area),
        floor: toStrictNumber(values.params.floor)
      }
    }
  }

  return {
    ...basePayload,
    category: "electronics",
    params: {
      type: toStrictTrimmedString(values.params.type),
      brand: toStrictTrimmedString(values.params.brand),
      model: toStrictTrimmedString(values.params.model),
      condition: toStrictTrimmedString(values.params.condition),
      color: toStrictTrimmedString(values.params.color)
    }
  }
}

function mapIssuePathToFieldPath(
  path: readonly PropertyKey[]
): AdEditFormPath | null {
  const [rootSegment, nestedSegment] = path

  if (
    rootSegment === "title" ||
    rootSegment === "price" ||
    rootSegment === "description" ||
    rootSegment === "category"
  ) {
    return rootSegment
  }

  if (rootSegment === "params" && typeof nestedSegment === "string") {
    return `params.${nestedSegment}`
  }

  return null
}

function getFieldErrorMessage(fieldPath: AdEditFormPath): string {
  if (fieldPath === "title") {
    return "Введите заголовок"
  }

  if (fieldPath === "price") {
    return "Укажите корректную цену"
  }

  if (NUMERIC_FIELDS.has(fieldPath)) {
    return "Укажите числовое значение"
  }

  if (SELECT_FIELDS.has(fieldPath)) {
    return "Выберите значение из списка"
  }

  return "Заполните обязательное поле"
}

function applyPayloadValidationErrors(
  form: AdEditFormApi,
  issues: readonly { path: readonly PropertyKey[] }[]
): void {
  const fieldErrors = new Map<AdEditFormPath, string>()

  for (const issue of issues) {
    const fieldPath = mapIssuePathToFieldPath(issue.path)

    if (fieldPath === null || fieldErrors.has(fieldPath)) {
      continue
    }

    fieldErrors.set(fieldPath, getFieldErrorMessage(fieldPath))
  }

  let firstFieldPath: AdEditFormPath | null = null

  for (const [fieldPath, message] of fieldErrors) {
    firstFieldPath ??= fieldPath

    form.setError(fieldPath, {
      type: "manual",
      message
    })
  }

  if (firstFieldPath !== null) {
    form.setFocus(firstFieldPath)
  }
}

export async function ensureValidAiPayload(
  form: AdEditFormApi
): Promise<EnsureValidAiPayloadResult> {
  const requiredFieldPaths = toRequiredFieldPaths(form.getValues("category"))

  form.clearErrors(requiredFieldPaths)

  const isFormValid = await form.trigger(requiredFieldPaths, {
    shouldFocus: true
  })

  if (!isFormValid) {
    return { isValid: false }
  }

  const parseResult = ItemUpdateInSchema.safeParse(
    buildAiPayloadCandidate(form.getValues())
  )

  if (!parseResult.success) {
    applyPayloadValidationErrors(form, parseResult.error.issues)

    return { isValid: false }
  }

  return {
    isValid: true,
    payload: parseResult.data
  }
}

export type { AdEditFormApi, EnsureValidAiPayloadResult }

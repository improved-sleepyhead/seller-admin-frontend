import { safeParseItemUpdate } from "./ad-form.codec"
import { REQUIRED_KEYS_BY_CATEGORY } from "./ad.constants"

import type { ItemUpdateIn } from "../api"
import type { AdEditFormApi } from "./ad-form.types"
import type { AdEditFormValues } from "./ad.types"
import type { Path } from "react-hook-form"

type AdEditFormPath = Path<AdEditFormValues>

interface ValidPayload {
  isValid: true
  payload: ItemUpdateIn
}

interface InvalidPayload {
  isValid: false
}

type AiPayloadResult = ValidPayload | InvalidPayload

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
  const categoryFieldPaths = REQUIRED_KEYS_BY_CATEGORY[category].map(
    key => `params.${key}` as AdEditFormPath
  )

  return ["title", "price", ...categoryFieldPaths]
}

function getFieldPath(path: readonly PropertyKey[]): AdEditFormPath | null {
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

function applyFieldErrors(
  form: AdEditFormApi,
  issues: readonly { path: readonly PropertyKey[] }[]
): void {
  const fieldErrors = new Map<AdEditFormPath, string>()

  for (const issue of issues) {
    const fieldPath = getFieldPath(issue.path)

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
): Promise<AiPayloadResult> {
  const requiredFieldPaths = toRequiredFieldPaths(form.getValues("category"))

  form.clearErrors(requiredFieldPaths)

  const isFormValid = await form.trigger(requiredFieldPaths, {
    shouldFocus: true
  })

  if (!isFormValid) {
    return { isValid: false }
  }

  const parseResult = safeParseItemUpdate(form.getValues())

  if (!parseResult.success) {
    applyFieldErrors(form, parseResult.error.issues)

    return { isValid: false }
  }

  return {
    isValid: true,
    payload: parseResult.data
  }
}

export type { AdEditFormApi, AiPayloadResult }

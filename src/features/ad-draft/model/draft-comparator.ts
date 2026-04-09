import type { AdDetailsDto } from "@/entities/ad/api"
import {
  areAdEditFormValuesEqual,
  getAdServerHash,
  toAdEditFormValues,
  type AdEditFormValues
} from "@/entities/ad/model"

export function getServerHash(ad: AdDetailsDto): string {
  return getAdServerHash(ad)
}

export function toServerForm(ad: AdDetailsDto): AdEditFormValues {
  return toAdEditFormValues(ad)
}

export function areDraftFormsEqual(
  left: AdEditFormValues,
  right: AdEditFormValues
): boolean {
  return areAdEditFormValuesEqual(left, right)
}

export function isDraftDifferentFromServer(
  draftForm: AdEditFormValues,
  serverForm: AdEditFormValues
): boolean {
  return !areDraftFormsEqual(draftForm, serverForm)
}

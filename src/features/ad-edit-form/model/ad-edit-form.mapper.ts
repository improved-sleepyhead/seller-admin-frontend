import type { AdDetailsDto } from "@/entities/ad/api"
import { toAdEditFormValues, type AdEditFormValues } from "@/entities/ad/model"

export function toFormValues(ad: AdDetailsDto): AdEditFormValues {
  return toAdEditFormValues(ad)
}

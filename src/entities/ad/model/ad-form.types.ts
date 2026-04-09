import type { AdEditFormValues } from "./ad.types"
import type { UseFormReturn } from "react-hook-form"

export type AdEditFormApi = UseFormReturn<
  AdEditFormValues,
  unknown,
  AdEditFormValues
>

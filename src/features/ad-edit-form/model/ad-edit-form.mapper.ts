import type { AdDetailsDto } from "@/entities/ad/api"
import type { AdEditFormValues } from "@/entities/ad/model"

function toTextValue(value: string | undefined): string {
  return value ?? ""
}

function toNumericValue(value: number | undefined): number | string {
  return value ?? ""
}

const AD_DETAILS_TO_FORM_VALUES_BUILDERS = {
  auto: (
    ad: Extract<AdDetailsDto, { category: "auto" }>
  ): AdEditFormValues => ({
    category: ad.category,
    description: ad.description ?? "",
    params: {
      brand: toTextValue(ad.params.brand),
      enginePower: toNumericValue(ad.params.enginePower),
      mileage: toNumericValue(ad.params.mileage),
      model: toTextValue(ad.params.model),
      transmission: toTextValue(ad.params.transmission),
      yearOfManufacture: toNumericValue(ad.params.yearOfManufacture)
    },
    price: ad.price,
    title: ad.title
  }),
  electronics: (
    ad: Extract<AdDetailsDto, { category: "electronics" }>
  ): AdEditFormValues => ({
    category: ad.category,
    description: ad.description ?? "",
    params: {
      brand: toTextValue(ad.params.brand),
      color: toTextValue(ad.params.color),
      condition: toTextValue(ad.params.condition),
      model: toTextValue(ad.params.model),
      type: toTextValue(ad.params.type)
    },
    price: ad.price,
    title: ad.title
  }),
  real_estate: (
    ad: Extract<AdDetailsDto, { category: "real_estate" }>
  ): AdEditFormValues => ({
    category: ad.category,
    description: ad.description ?? "",
    params: {
      address: toTextValue(ad.params.address),
      area: toNumericValue(ad.params.area),
      floor: toNumericValue(ad.params.floor),
      type: toTextValue(ad.params.type)
    },
    price: ad.price,
    title: ad.title
  })
} satisfies {
  [Category in AdDetailsDto["category"]]: (
    ad: Extract<AdDetailsDto, { category: Category }>
  ) => AdEditFormValues
}

function buildFormValuesForAd<Category extends AdDetailsDto["category"]>(
  ad: Extract<AdDetailsDto, { category: Category }>
): AdEditFormValues {
  const buildFormValues = AD_DETAILS_TO_FORM_VALUES_BUILDERS[ad.category] as (
    ad: Extract<AdDetailsDto, { category: Category }>
  ) => AdEditFormValues

  return buildFormValues(ad)
}

export function mapAdDetailsToFormValues(ad: AdDetailsDto): AdEditFormValues {
  return buildFormValuesForAd(ad)
}

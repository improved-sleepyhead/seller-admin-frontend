import type { AdDetailsDto } from "@/entities/ad/api"
import type { AdEditFormValues } from "@/entities/ad/model"

function toTextValue(value: string | undefined): string {
  return value ?? ""
}

function toNumericValue(value: number | undefined): number | string {
  return value ?? ""
}

export function mapAdDetailsToFormValues(ad: AdDetailsDto): AdEditFormValues {
  if (ad.category === "auto") {
    return {
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
    }
  }

  if (ad.category === "real_estate") {
    return {
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
    }
  }

  return {
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
  }
}

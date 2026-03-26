// eslint-disable-next-line import/no-internal-modules -- zod resolver is provided by package subpath
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import {
  AD_CATEGORIES,
  AD_CATEGORY_LABELS,
  type AdDetailsDto,
  type AdEditFormValues
} from "@/entities/ad"
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from "@/shared/ui/shadcn"

import { mapAdDetailsToFormValues, AdEditFormSchema } from "../model"
import { CategoryFields } from "./category-fields"
import { getCategoryDefaultParams } from "./category-fields-config"

type FormSubmitHandler = (
  values: AdEditFormValues
) => Promise<void> | void | undefined

interface AdEditFormProps {
  ad: AdDetailsDto
  isSavePending?: boolean
  onSubmit?: FormSubmitHandler
}

function isAdCategory(value: string): value is AdEditFormValues["category"] {
  return AD_CATEGORIES.includes(value as AdEditFormValues["category"])
}

export function AdEditForm({
  ad,
  isSavePending = false,
  onSubmit
}: AdEditFormProps) {
  const form = useForm<AdEditFormValues, unknown, AdEditFormValues>({
    defaultValues: mapAdDetailsToFormValues(ad),
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldUnregister: true,
    resolver: zodResolver(AdEditFormSchema)
  })
  const { reset } = form

  useEffect(() => {
    reset(mapAdDetailsToFormValues(ad))
  }, [ad, reset])

  const category = form.watch("category")

  const submitHandler = form.handleSubmit(async values => {
    if (!onSubmit) {
      return
    }

    await onSubmit(values)
  })

  return (
    <Form {...form}>
      <form
        className="grid gap-6"
        noValidate
        onSubmit={event => {
          void submitHandler(event)
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Категория</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={nextCategory => {
                    if (
                      !isAdCategory(nextCategory) ||
                      nextCategory === field.value
                    ) {
                      return
                    }

                    field.onChange(nextCategory)
                    form.setValue(
                      "params",
                      getCategoryDefaultParams(nextCategory),
                      {
                        shouldDirty: true,
                        shouldValidate: true
                      }
                    )
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AD_CATEGORIES.map(categoryOption => (
                      <SelectItem key={categoryOption} value={categoryOption}>
                        {AD_CATEGORY_LABELS[categoryOption]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Цена</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Заголовок</FormLabel>
              <FormControl>
                <Input {...field} value={field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea rows={6} {...field} value={field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <CategoryFields category={category} form={form} />

        <div className="flex justify-end">
          <Button
            disabled={
              !form.formState.isValid ||
              form.formState.isSubmitting ||
              isSavePending
            }
            type="submit"
          >
            Сохранить
          </Button>
        </div>
      </form>
    </Form>
  )
}

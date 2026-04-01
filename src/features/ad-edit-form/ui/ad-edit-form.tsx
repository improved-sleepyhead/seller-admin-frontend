// eslint-disable-next-line import/no-internal-modules -- zod resolver is provided by package subpath
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, type ComponentType } from "react"
import { useForm, type UseFormReturn } from "react-hook-form"

import { AD_CATEGORIES, type AdDetailsDto } from "@/entities/ad/api"
import { AD_CATEGORY_LABELS, type AdEditFormValues } from "@/entities/ad/model"
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
const NUMBER_INPUT_NO_SPINNERS_CLASS =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

export interface AdEditFormActionButtonProps {
  disabled: boolean
  isPending: boolean
}

export interface AdEditFormCategoryChangeRequest {
  applyCategoryChange: () => void
  currentCategory: AdEditFormValues["category"]
  nextCategory: AdEditFormValues["category"]
}

type AdEditFormActionButtonComponent =
  ComponentType<AdEditFormActionButtonProps>

interface AdEditFormProps {
  ad: AdDetailsDto
  CancelButton?: AdEditFormActionButtonComponent
  formId?: string
  hideActions?: boolean
  isSavePending?: boolean
  onFormReady?: (
    form: UseFormReturn<AdEditFormValues, unknown, AdEditFormValues>
  ) => void
  onCategoryChangeRequest?: (request: AdEditFormCategoryChangeRequest) => void
  onSubmit?: FormSubmitHandler
  SubmitButton?: AdEditFormActionButtonComponent
}

function isAdCategory(value: string): value is AdEditFormValues["category"] {
  return AD_CATEGORIES.includes(value as AdEditFormValues["category"])
}

function DefaultSubmitButton({
  disabled,
  isPending
}: AdEditFormActionButtonProps) {
  return (
    <Button disabled={disabled} type="submit">
      {isPending ? "Сохраняем..." : "Сохранить"}
    </Button>
  )
}

export function AdEditForm({
  ad,
  CancelButton,
  formId,
  hideActions = false,
  isSavePending = false,
  onFormReady,
  onCategoryChangeRequest,
  onSubmit,
  SubmitButton = DefaultSubmitButton
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

  useEffect(() => {
    if (!onFormReady) {
      return
    }

    onFormReady(form)
  }, [form, onFormReady])

  const category = form.watch("category")

  const submitHandler = form.handleSubmit(async values => {
    if (!onSubmit) {
      return
    }

    await onSubmit(values)
  })

  const isSubmitDisabled =
    !form.formState.isValid || form.formState.isSubmitting || isSavePending
  const isCancelDisabled = form.formState.isSubmitting || isSavePending

  return (
    <Form {...form}>
      <form
        id={formId}
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

                    const applyCategoryChange = () => {
                      field.onChange(nextCategory)
                      form.setValue(
                        "params",
                        getCategoryDefaultParams(nextCategory),
                        {
                          shouldDirty: true,
                          shouldValidate: true
                        }
                      )
                    }

                    if (onCategoryChangeRequest) {
                      onCategoryChangeRequest({
                        applyCategoryChange,
                        currentCategory: field.value,
                        nextCategory
                      })
                      return
                    }

                    applyCategoryChange()
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
                    className={NUMBER_INPUT_NO_SPINNERS_CLASS}
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
                <Textarea rows={4} {...field} value={field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <CategoryFields category={category} form={form} />

        {hideActions ? null : (
          <div className="flex justify-end gap-2">
            {CancelButton ? (
              <CancelButton
                disabled={isCancelDisabled}
                isPending={isSavePending}
              />
            ) : null}
            <SubmitButton
              disabled={isSubmitDisabled}
              isPending={isSavePending}
            />
          </div>
        )}
      </form>
    </Form>
  )
}

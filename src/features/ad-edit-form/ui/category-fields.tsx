import { type UseFormReturn } from "react-hook-form"

import type { AdEditFormValues } from "@/entities/ad"
import {
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
  SelectValue
} from "@/shared/ui/shadcn"

import {
  CATEGORY_FIELDS_CONFIG,
  type CategoryFieldConfig,
  type CategoryNumberFieldConfig,
  type CategorySelectFieldConfig,
  type CategoryTextFieldConfig
} from "./category-fields-config"

import type { JSX } from "react"

interface CategoryFieldsProps {
  category: AdEditFormValues["category"]
  form: UseFormReturn<AdEditFormValues, unknown, AdEditFormValues>
}

interface CategoryFieldRendererProps<
  TFieldConfig extends CategoryFieldConfig = CategoryFieldConfig
> {
  config: TFieldConfig
  form: UseFormReturn<AdEditFormValues, unknown, AdEditFormValues>
}

function CategoryTextField({
  config,
  form
}: CategoryFieldRendererProps<CategoryTextFieldConfig>) {
  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{config.label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder={config.placeholder}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function CategoryNumberField({
  config,
  form
}: CategoryFieldRendererProps<CategoryNumberFieldConfig>) {
  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{config.label}</FormLabel>
          <FormControl>
            <Input
              inputMode="numeric"
              placeholder={config.placeholder}
              type="number"
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function CategorySelectField({
  config,
  form
}: CategoryFieldRendererProps<CategorySelectFieldConfig>) {
  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{config.label}</FormLabel>
          <Select
            value={typeof field.value === "string" ? field.value : ""}
            onValueChange={field.onChange}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={config.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {config.options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

type CategoryFieldRenderer = (props: CategoryFieldRendererProps) => JSX.Element

const CATEGORY_FIELD_RENDERERS: Record<
  CategoryFieldConfig["kind"],
  CategoryFieldRenderer
> = {
  number: ({ config, form }) => (
    <CategoryNumberField
      config={config as CategoryNumberFieldConfig}
      form={form}
    />
  ),
  select: ({ config, form }) => (
    <CategorySelectField
      config={config as CategorySelectFieldConfig}
      form={form}
    />
  ),
  text: ({ config, form }) => (
    <CategoryTextField config={config as CategoryTextFieldConfig} form={form} />
  )
}

function renderCategoryField(
  category: AdEditFormValues["category"],
  config: CategoryFieldConfig,
  form: UseFormReturn<AdEditFormValues, unknown, AdEditFormValues>
) {
  const FieldRenderer = CATEGORY_FIELD_RENDERERS[config.kind]

  return (
    <FieldRenderer
      key={`${category}-${config.name}`}
      config={config}
      form={form}
    />
  )
}

export function CategoryFields({ category, form }: CategoryFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {CATEGORY_FIELDS_CONFIG[category].map(config =>
        renderCategoryField(category, config, form)
      )}
    </div>
  )
}

import { type UseFormReturn } from "react-hook-form"

import type { AdEditFormValues } from "@/entities/ad/model"
import { cn } from "@/shared/lib/cn"
import {
  Button,
  FormControl,
  FormDescription,
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

const OPTIONAL_FIELD_WARNING_TEXT = "Рекомендуем заполнить поле"
const NUMBER_INPUT_NO_SPINNERS_CLASS =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

function hasFieldValue(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0
  }

  return value !== null && value !== undefined
}

function WarningLabel({
  hasValue,
  label,
  onClear
}: {
  hasValue: boolean
  label: string
  onClear: () => void
}) {
  return (
    <div className="grid h-7 grid-cols-[1fr_auto] items-center gap-2">
      <FormLabel>{label}</FormLabel>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 px-2 py-0.5 text-xs",
          !hasValue && "pointer-events-none invisible"
        )}
        onClick={onClear}
      >
        Очистить
      </Button>
    </div>
  )
}

function CategoryTextField({
  config,
  form
}: CategoryFieldRendererProps<CategoryTextFieldConfig>) {
  return (
    <FormField
      control={form.control}
      name={config.name}
      render={({ field, fieldState }) => {
        const shouldShowWarning =
          !fieldState.error && !hasFieldValue(field.value)

        return (
          <FormItem>
            <WarningLabel
              label={config.label}
              hasValue={hasFieldValue(field.value)}
              onClear={() => {
                form.setValue(config.name, "", {
                  shouldDirty: true,
                  shouldTouch: true
                })
              }}
            />
            <FormControl>
              <Input
                {...field}
                placeholder={config.placeholder}
                value={field.value ?? ""}
                className={cn(
                  shouldShowWarning &&
                    "border-amber-400/70 focus-visible:border-amber-500 focus-visible:ring-amber-500/30 dark:border-amber-500/60"
                )}
              />
            </FormControl>
            {fieldState.error ? null : (
              <FormDescription
                className={cn(
                  "min-h-5",
                  shouldShowWarning
                    ? "text-amber-700 dark:text-amber-400"
                    : "invisible"
                )}
              >
                {OPTIONAL_FIELD_WARNING_TEXT}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )
      }}
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
      render={({ field, fieldState }) => {
        const shouldShowWarning =
          !fieldState.error && !hasFieldValue(field.value)

        return (
          <FormItem>
            <WarningLabel
              label={config.label}
              hasValue={hasFieldValue(field.value)}
              onClear={() => {
                form.setValue(config.name, "", {
                  shouldDirty: true,
                  shouldTouch: true
                })
              }}
            />
            <FormControl>
              <Input
                inputMode="numeric"
                placeholder={config.placeholder}
                type="number"
                {...field}
                value={field.value ?? ""}
                className={cn(
                  NUMBER_INPUT_NO_SPINNERS_CLASS,
                  shouldShowWarning &&
                    "border-amber-400/70 focus-visible:border-amber-500 focus-visible:ring-amber-500/30 dark:border-amber-500/60"
                )}
              />
            </FormControl>
            {fieldState.error ? null : (
              <FormDescription
                className={cn(
                  "min-h-5",
                  shouldShowWarning
                    ? "text-amber-700 dark:text-amber-400"
                    : "invisible"
                )}
              >
                {OPTIONAL_FIELD_WARNING_TEXT}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )
      }}
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
      render={({ field, fieldState }) => {
        const shouldShowWarning =
          !fieldState.error && !hasFieldValue(field.value)

        return (
          <FormItem>
            <WarningLabel
              label={config.label}
              hasValue={hasFieldValue(field.value)}
              onClear={() => {
                form.setValue(config.name, "", {
                  shouldDirty: true,
                  shouldTouch: true
                })
              }}
            />
            <Select
              value={typeof field.value === "string" ? field.value : ""}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger
                  className={cn(
                    "w-full",
                    shouldShowWarning &&
                      "border-amber-400/70 focus-visible:border-amber-500 focus-visible:ring-amber-500/30 dark:border-amber-500/60"
                  )}
                >
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
            {fieldState.error ? null : (
              <FormDescription
                className={cn(
                  "min-h-5",
                  shouldShowWarning
                    ? "text-amber-700 dark:text-amber-400"
                    : "invisible"
                )}
              >
                {OPTIONAL_FIELD_WARNING_TEXT}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )
      }}
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

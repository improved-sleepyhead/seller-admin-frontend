import { cn } from "@/shared/lib/cn"

import type { FilledSpec } from "../model"

interface AdSpecsListProps {
  className?: string
  specs: FilledSpec[]
}

function isNonEmptyText(value: string): boolean {
  return value.trim().length > 0
}

export function AdSpecsList({ className, specs }: AdSpecsListProps) {
  const visibleSpecs = specs.filter(
    spec => isNonEmptyText(spec.label) && isNonEmptyText(spec.value)
  )

  if (visibleSpecs.length === 0) {
    return null
  }

  return (
    <dl className={cn("space-y-2", className)}>
      {visibleSpecs.map(spec => (
        <div
          key={`${spec.label}:${spec.value}`}
          className="flex items-start justify-between gap-3 text-sm"
        >
          <dt className="text-muted-foreground">{spec.label}</dt>
          <dd className="text-right font-medium">{spec.value}</dd>
        </div>
      ))}
    </dl>
  )
}

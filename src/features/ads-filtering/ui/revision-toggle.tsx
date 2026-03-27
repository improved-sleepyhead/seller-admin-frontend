import { Label, Switch } from "@/shared/ui/shadcn"

import { useAdsFiltering } from "../model"

export function RevisionToggle() {
  const { needsRevision, setNeedsRevision } = useAdsFiltering()

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
      <Label htmlFor="revision-toggle">Требуют доработки</Label>
      <Switch
        id="revision-toggle"
        checked={needsRevision}
        onCheckedChange={setNeedsRevision}
      />
    </div>
  )
}

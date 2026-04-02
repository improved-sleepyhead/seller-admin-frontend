import { memo } from "react"

import { CancelEditButton } from "@/features/ad-cancel-edit"
import { SaveAdButton } from "@/features/ad-save"

import type { AdEditPageReadyState } from "../model"

const EDIT_FORM_ID = "ad-edit-form"

interface AdEditFooterActionsProps {
  adId: number
  navigationState: AdEditPageReadyState["navigationState"]
  savePending: boolean
}

export const AdEditFooterActions = memo(function AdEditFooterActions({
  adId,
  navigationState,
  savePending
}: AdEditFooterActionsProps) {
  return (
    <>
      <CancelEditButton
        disabled={savePending}
        itemId={adId}
        navigationState={navigationState}
      />
      <SaveAdButton
        disabled={savePending}
        form={EDIT_FORM_ID}
        isPending={savePending}
      />
    </>
  )
})

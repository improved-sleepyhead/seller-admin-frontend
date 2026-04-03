import { memo } from "react"

import { AdEditLayout } from "@/widgets/ad-edit-layout"

import { AdEditAiToolsSection } from "./ad-edit-ai-tools-section"
import { AdEditFooterActions } from "./ad-edit-footer-actions"
import { AdEditFormSection } from "./ad-edit-form-section"

import type { AdEditPageReadyState } from "../model"

type AdEditPageReadyContentProps = Pick<
  AdEditPageReadyState,
  "aiSection" | "footerSection" | "formSection"
>

export const AdEditPageReadyContent = memo(function AdEditPageReadyContent({
  aiSection,
  footerSection,
  formSection
}: AdEditPageReadyContentProps) {
  return (
    <AdEditLayout
      aiArea={<AdEditAiToolsSection {...aiSection} />}
      footer={<AdEditFooterActions {...footerSection} />}
      formArea={<AdEditFormSection {...formSection} />}
    />
  )
})

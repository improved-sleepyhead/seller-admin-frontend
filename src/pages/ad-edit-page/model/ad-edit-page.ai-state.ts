import type { AiStatusDto } from "@/entities/ad/api"

import type { AdEditPageAiState } from "./ad-edit-page.contract"

type AiStatusKind = "pending" | "error" | "enabled" | "disabled"

interface AiStatusView {
  badgeVariant: AdEditPageAiState["badgeVariant"]
  label: string
  message: string
}

const AI_FEATURE_LABELS = {
  chat: "чат",
  description: "описание",
  price: "цена"
} satisfies Record<keyof AiStatusDto["features"], string>

function getDisabledFeatures(aiStatus: AiStatusDto | null): string[] {
  if (aiStatus?.enabled !== true) {
    return []
  }

  return Object.entries(AI_FEATURE_LABELS).flatMap(
    ([featureKey, featureLabel]) =>
      aiStatus.features[featureKey as keyof AiStatusDto["features"]]
        ? []
        : [featureLabel]
  )
}

const AI_STATUS_RULES = [
  {
    matches: ({
      isPending
    }: {
      aiEnabled: boolean
      isError: boolean
      isPending: boolean
    }) => isPending,
    status: "pending"
  },
  {
    matches: ({
      isError
    }: {
      aiEnabled: boolean
      isError: boolean
      isPending: boolean
    }) => isError,
    status: "error"
  },
  {
    matches: ({
      aiEnabled
    }: {
      aiEnabled: boolean
      isError: boolean
      isPending: boolean
    }) => aiEnabled,
    status: "enabled"
  }
] as const satisfies readonly {
  matches: (args: {
    aiEnabled: boolean
    isError: boolean
    isPending: boolean
  }) => boolean
  status: AiStatusKind
}[]

function getAiStatusKind(args: {
  aiEnabled: boolean
  isError: boolean
  isPending: boolean
}): AiStatusKind {
  return AI_STATUS_RULES.find(rule => rule.matches(args))?.status ?? "disabled"
}

const AI_STATUS_VIEWS = {
  disabled: (): AiStatusView => ({
    badgeVariant: "secondary",
    label: "AI недоступен",
    message:
      "AI отключен в текущем окружении. Основное редактирование доступно без ограничений."
  }),
  enabled: ({
    disabledFeatures
  }: {
    disabledFeatures: string[]
  }): AiStatusView => ({
    badgeVariant: "default",
    label: "AI доступен",
    message:
      disabledFeatures.length > 0
        ? `Частично недоступно: ${disabledFeatures.join(", ")}.`
        : "Все AI-инструменты доступны."
  }),
  error: (): AiStatusView => ({
    badgeVariant: "destructive",
    label: "AI недоступен",
    message: "Не удалось загрузить AI-статус. AI-контролы временно отключены."
  }),
  pending: (): AiStatusView => ({
    badgeVariant: "secondary",
    label: "Проверка AI...",
    message:
      "Проверяем доступность AI. До завершения проверки AI-контролы отключены."
  })
} satisfies Record<
  AiStatusKind,
  (args: { disabledFeatures: string[] }) => AiStatusView
>

export function getAdEditPageAiState(
  aiStatus: AiStatusDto | null,
  isError: boolean,
  isPending: boolean
): AdEditPageAiState {
  const aiEnabled = !isError && aiStatus?.enabled === true
  const disabledFeatures = getDisabledFeatures(aiStatus)
  const statusKind = getAiStatusKind({
    aiEnabled,
    isError,
    isPending
  })
  const view = AI_STATUS_VIEWS[statusKind]({ disabledFeatures })

  return {
    ...view,
    chatEnabled: aiEnabled && aiStatus?.features.chat === true,
    descriptionEnabled: aiEnabled && aiStatus?.features.description === true,
    model: aiStatus?.model ?? "не указана",
    priceEnabled: aiEnabled && aiStatus?.features.price === true
  }
}

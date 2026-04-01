import type { AiStatusDto } from "@/entities/ad/api"

import type { AdEditPageAiState } from "./ad-edit-page.contract"

function getPartiallyDisabledFeatures(aiStatus: AiStatusDto | null): string[] {
  if (aiStatus?.enabled !== true) {
    return []
  }

  return [
    !aiStatus.features.description ? "описание" : null,
    !aiStatus.features.price ? "цена" : null,
    !aiStatus.features.chat ? "чат" : null
  ].filter((value): value is string => value !== null)
}

export function getAdEditPageAiState(
  aiStatus: AiStatusDto | null,
  isError: boolean,
  isPending: boolean
): AdEditPageAiState {
  const aiEnabled = !isError && aiStatus?.enabled === true
  const partiallyDisabledFeatures = getPartiallyDisabledFeatures(aiStatus)

  let badgeVariant: AdEditPageAiState["badgeVariant"] = "secondary"
  let label = "AI недоступен"
  let message =
    "AI отключен в текущем окружении. Основное редактирование доступно без ограничений."

  if (isPending) {
    label = "Проверка AI..."
    message =
      "Проверяем доступность AI. До завершения проверки AI-контролы отключены."
  } else if (isError) {
    badgeVariant = "destructive"
    message = "Не удалось загрузить AI-статус. AI-контролы временно отключены."
  } else if (aiEnabled) {
    badgeVariant = "default"
    label = "AI доступен"
    message =
      partiallyDisabledFeatures.length > 0
        ? `Частично недоступно: ${partiallyDisabledFeatures.join(", ")}.`
        : "Все AI-инструменты доступны."
  }

  return {
    badgeVariant,
    chatEnabled: aiEnabled && aiStatus.features.chat,
    descriptionEnabled: aiEnabled && aiStatus.features.description,
    label,
    message,
    model: aiStatus?.model ?? "не указана",
    priceEnabled: aiEnabled && aiStatus.features.price
  }
}

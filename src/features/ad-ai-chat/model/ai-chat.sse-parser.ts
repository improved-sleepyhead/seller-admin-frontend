import { z } from "zod/v4"

import { AiUsageSchema } from "@/entities/ad"

import { BackendErrorSchema } from "./ai-chat.transport-errors"

import type {
  AiChatStreamEvent,
  ParseAiChatSseBufferResult
} from "./ai-chat.transport.types"

const AiChatStreamMetaDataSchema = z.object({
  model: z.string().min(1)
})

const AiChatStreamChunkDataSchema = z.object({
  content: z.string()
})

const AiChatStreamDoneDataSchema = z.object({
  model: z.string().optional(),
  usage: AiUsageSchema.optional()
})

interface ParsedSseFrame {
  dataLines: string[]
  event: string | null
}

interface SplitSsePayloadResult {
  blocks: string[]
  remainder: string
}

function normalizeSsePayload(rawPayload: string): SplitSsePayloadResult {
  const normalizedPayload = rawPayload
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
  const blocks: string[] = []
  let startIndex = 0

  while (startIndex < normalizedPayload.length) {
    const separatorIndex = normalizedPayload.indexOf("\n\n", startIndex)

    if (separatorIndex === -1) {
      break
    }

    const block = normalizedPayload.slice(startIndex, separatorIndex).trim()

    if (block.length > 0) {
      blocks.push(block)
    }

    startIndex = separatorIndex + 2
  }

  return {
    blocks,
    remainder: normalizedPayload.slice(startIndex)
  }
}

function parseSseFrame(frame: string): ParsedSseFrame {
  let event: string | null = null
  const dataLines: string[] = []

  for (const line of frame.split("\n")) {
    if (line.startsWith(":")) {
      continue
    }

    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim()
      continue
    }

    if (line.startsWith("data:")) {
      const rawData = line.slice("data:".length)
      dataLines.push(rawData.startsWith(" ") ? rawData.slice(1) : rawData)
    }
  }

  return {
    dataLines,
    event
  }
}

function parseJsonPayload(rawPayload: string): unknown {
  try {
    return JSON.parse(rawPayload)
  } catch {
    throw new Error("AI stream returned malformed JSON payload.")
  }
}

function parseSseEvent(frame: string): AiChatStreamEvent | null {
  const parsedFrame = parseSseFrame(frame)

  if (parsedFrame.event === null || parsedFrame.dataLines.length === 0) {
    return null
  }

  const rawData = parsedFrame.dataLines.join("\n")
  const payload = parseJsonPayload(rawData)

  if (parsedFrame.event === "meta") {
    return {
      data: AiChatStreamMetaDataSchema.parse(payload),
      event: "meta"
    }
  }

  if (parsedFrame.event === "chunk") {
    return {
      data: AiChatStreamChunkDataSchema.parse(payload),
      event: "chunk"
    }
  }

  if (parsedFrame.event === "done") {
    return {
      data: AiChatStreamDoneDataSchema.parse(payload),
      event: "done"
    }
  }

  if (parsedFrame.event === "error") {
    return {
      data: BackendErrorSchema.parse(payload),
      event: "error"
    }
  }

  return null
}

export function parseAiChatSseBuffer(
  rawPayload: string
): ParseAiChatSseBufferResult {
  const { blocks, remainder } = normalizeSsePayload(rawPayload)
  const events: AiChatStreamEvent[] = []

  for (const block of blocks) {
    const parsedEvent = parseSseEvent(block)

    if (parsedEvent !== null) {
      events.push(parsedEvent)
    }
  }

  return {
    events,
    remainder
  }
}

import { z } from "zod/v4"

import { AiUsageSchema } from "@/entities/ad/api"

import { BackendErrorSchema } from "./ai-chat.transport-errors"

import type {
  AiChatStreamEvent,
  ParseAiChatSseBufferResult
} from "./ai-chat.transport.types"

const MetaSchema = z.object({
  model: z.string().min(1)
})

const ChunkSchema = z.object({
  content: z.string()
})

const DoneSchema = z.object({
  model: z.string().optional(),
  usage: AiUsageSchema.optional()
})

interface ParsedSseFrame {
  dataLines: string[]
  event: string | null
}

interface SplitPayloadResult {
  blocks: string[]
  remainder: string
}

function splitPayload(rawPayload: string): SplitPayloadResult {
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

function parseFrame(frame: string): ParsedSseFrame {
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

function parsePayload(rawPayload: string): unknown {
  try {
    return JSON.parse(rawPayload)
  } catch {
    throw new Error("AI stream returned malformed JSON payload.")
  }
}

function parseEvent(frame: string): AiChatStreamEvent | null {
  const parsedFrame = parseFrame(frame)

  if (parsedFrame.event === null || parsedFrame.dataLines.length === 0) {
    return null
  }

  const rawData = parsedFrame.dataLines.join("\n")
  const payload = parsePayload(rawData)

  if (parsedFrame.event === "meta") {
    return {
      data: MetaSchema.parse(payload),
      event: "meta"
    }
  }

  if (parsedFrame.event === "chunk") {
    return {
      data: ChunkSchema.parse(payload),
      event: "chunk"
    }
  }

  if (parsedFrame.event === "done") {
    return {
      data: DoneSchema.parse(payload),
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
  const { blocks, remainder } = splitPayload(rawPayload)
  const events: AiChatStreamEvent[] = []

  for (const block of blocks) {
    const parsedEvent = parseEvent(block)

    if (parsedEvent !== null) {
      events.push(parsedEvent)
    }
  }

  return {
    events,
    remainder
  }
}

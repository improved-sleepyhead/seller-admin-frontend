import { z } from "zod/v4"

import type { AiChatRequest, AiUsageDto } from "@/entities/ad"
import { apiClient } from "@/shared/api/client"
import { AppApiError, type AppApiErrorCode } from "@/shared/api/error"

const AI_CHAT_STREAM_PATH = "/api/ai/chat"

const AiUsageSchema: z.ZodType<AiUsageDto> = z.object({
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  totalTokens: z.number().optional()
})

const BackendErrorSchema = z.object({
  code: z.string().optional(),
  details: z.unknown().optional(),
  message: z.string().optional(),
  success: z.literal(false)
})

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

interface AiChatStreamErrorPayload {
  code?: string
  details?: unknown
  message?: string
  success: false
}

export type AiChatStreamEvent =
  | {
      event: "chunk"
      data: z.infer<typeof AiChatStreamChunkDataSchema>
    }
  | {
      event: "done"
      data: z.infer<typeof AiChatStreamDoneDataSchema>
    }
  | {
      event: "error"
      data: AiChatStreamErrorPayload
    }
  | {
      event: "meta"
      data: z.infer<typeof AiChatStreamMetaDataSchema>
    }

interface ParsedSseFrame {
  dataLines: string[]
  event: string | null
}

interface SplitSsePayloadResult {
  blocks: string[]
  remainder: string
}

export interface ParseAiChatSseBufferResult {
  events: AiChatStreamEvent[]
  remainder: string
}

export interface AiChatStreamResult {
  message: {
    content: string
    role: "assistant"
  }
  model?: string
  usage?: AiUsageDto
}

export interface StreamAiChatOptions extends AiChatRequest {
  onChunk?: (chunk: string, aggregatedText: string) => void
  onDone?: (result: AiChatStreamResult) => void
  onMeta?: (model: string) => void
  signal: AbortSignal
}

const BACKEND_CODE_TO_APP_CODE: Record<string, AppApiErrorCode> = {
  AI_PROVIDER_ERROR: "AI_STREAM_ERROR",
  AI_STREAM_ERROR: "AI_STREAM_ERROR",
  AI_TIMEOUT: "AI_TIMEOUT",
  AI_UNAVAILABLE: "AI_UNAVAILABLE",
  BAD_REQUEST: "BAD_REQUEST",
  NETWORK_ERROR: "NETWORK_ERROR",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR"
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

function getBaseApiUrl(): string {
  const baseApiUrl = apiClient.defaults.baseURL

  if (typeof baseApiUrl !== "string" || baseApiUrl.length === 0) {
    throw new AppApiError({
      code: "BAD_REQUEST",
      message: "API base URL is not configured.",
      status: null
    })
  }

  return baseApiUrl
}

function mapAppErrorCode(
  rawCode: string | undefined,
  status: number | null
): AppApiErrorCode {
  if (rawCode) {
    const mappedCode = BACKEND_CODE_TO_APP_CODE[rawCode]

    if (mappedCode) {
      return mappedCode
    }
  }

  if (status === 404) {
    return "NOT_FOUND"
  }

  if (status === 408) {
    return "AI_TIMEOUT"
  }

  return "BAD_REQUEST"
}

function toAppApiError(
  errorPayload: {
    code?: string
    details?: unknown
    message?: string
  },
  status: number | null,
  fallbackCode: AppApiErrorCode,
  fallbackMessage: string
): AppApiError {
  const code = mapAppErrorCode(errorPayload.code, status)

  return new AppApiError({
    code: errorPayload.code ? code : fallbackCode,
    message: errorPayload.message ?? fallbackMessage,
    raw: errorPayload.details,
    status
  })
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError"
}

async function parseErrorResponse(response: Response): Promise<AppApiError> {
  const status = response.status

  try {
    const payload: unknown = await response.json()
    const parsedPayload = BackendErrorSchema.safeParse(payload)

    if (parsedPayload.success) {
      return toAppApiError(
        parsedPayload.data,
        status,
        "BAD_REQUEST",
        "AI chat request failed."
      )
    }
  } catch {
    // Fallback handled below.
  }

  return new AppApiError({
    code: mapAppErrorCode(undefined, status),
    message: "AI chat request failed.",
    status
  })
}

function createStreamEndedError(): AppApiError {
  return new AppApiError({
    code: "AI_STREAM_ERROR",
    message: "AI stream ended before done event.",
    status: null
  })
}

export async function streamAiChat({
  item,
  messages,
  onChunk,
  onDone,
  onMeta,
  signal,
  userMessage
}: StreamAiChatOptions): Promise<AiChatStreamResult> {
  let aggregatedText = ""
  let detectedModel: string | undefined

  try {
    const response = await fetch(
      new URL(AI_CHAT_STREAM_PATH, getBaseApiUrl()),
      {
        body: JSON.stringify({
          item,
          messages,
          userMessage
        } satisfies AiChatRequest),
        headers: {
          Accept: "text/event-stream",
          "Content-Type": "application/json"
        },
        method: "POST",
        signal
      }
    )

    if (!response.ok) {
      throw await parseErrorResponse(response)
    }

    if (!response.body) {
      throw new AppApiError({
        code: "AI_STREAM_ERROR",
        message: "AI stream is not available in response body.",
        status: response.status
      })
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let rawBuffer = ""

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      rawBuffer += decoder.decode(value, { stream: true })
      const { events, remainder } = parseAiChatSseBuffer(rawBuffer)
      rawBuffer = remainder

      for (const event of events) {
        if (event.event === "meta") {
          detectedModel = event.data.model
          onMeta?.(event.data.model)
          continue
        }

        if (event.event === "chunk") {
          aggregatedText += event.data.content
          onChunk?.(event.data.content, aggregatedText)
          continue
        }

        if (event.event === "done") {
          const streamResult: AiChatStreamResult = {
            message: {
              content: aggregatedText,
              role: "assistant"
            },
            model: event.data.model ?? detectedModel,
            usage: event.data.usage
          }

          onDone?.(streamResult)
          return streamResult
        }

        if (event.event === "error") {
          throw toAppApiError(
            event.data,
            null,
            "AI_STREAM_ERROR",
            "AI stream failed."
          )
        }
      }
    }

    rawBuffer += decoder.decode()

    if (rawBuffer.trim().length > 0) {
      const { events } = parseAiChatSseBuffer(rawBuffer)

      for (const event of events) {
        if (event.event === "done") {
          const streamResult: AiChatStreamResult = {
            message: {
              content: aggregatedText,
              role: "assistant"
            },
            model: event.data.model ?? detectedModel,
            usage: event.data.usage
          }

          onDone?.(streamResult)
          return streamResult
        }
      }
    }

    throw createStreamEndedError()
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    if (error instanceof AppApiError) {
      throw error
    }

    throw new AppApiError({
      code: "NETWORK_ERROR",
      message:
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Network request failed.",
      raw: error,
      status: null
    })
  }
}

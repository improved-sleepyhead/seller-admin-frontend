import type { AiChatRequest, AiUsageDto } from "@/entities/ad/api"

export interface AiChatStreamMetaData {
  model: string
}

export interface AiChatStreamChunkData {
  content: string
}

export interface AiChatStreamDoneData {
  model?: string
  usage?: AiUsageDto
}

export interface AiChatStreamErrorPayload {
  code?: string
  details?: unknown
  message?: string
  success: false
}

export type AiChatStreamEvent =
  | {
      event: "meta"
      data: AiChatStreamMetaData
    }
  | {
      event: "chunk"
      data: AiChatStreamChunkData
    }
  | {
      event: "done"
      data: AiChatStreamDoneData
    }
  | {
      event: "error"
      data: AiChatStreamErrorPayload
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

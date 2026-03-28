import type { AiChatRequest } from "@/entities/ad"
import { apiClient } from "@/shared/api/client"
import { AppApiError } from "@/shared/api/error"

import { parseAiChatSseBuffer } from "./ai-chat.sse-parser"
import {
  createStreamEndedError,
  isAbortError,
  parseErrorResponse,
  toAppApiError,
  toNetworkAppApiError
} from "./ai-chat.transport-errors"

import type {
  AiChatStreamResult,
  StreamAiChatOptions
} from "./ai-chat.transport.types"

const AI_CHAT_STREAM_PATH = "/api/ai/chat"

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

    throw toNetworkAppApiError(error)
  }
}

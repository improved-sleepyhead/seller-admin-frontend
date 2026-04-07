/* @vitest-environment jsdom */

import { beforeEach, describe, expect, it } from "vitest"

import { resetDraftRegistryStore } from "@/entities/ad/model"

import {
  getChatKey,
  readAdAiChatHistory,
  saveAdAiChatHistory
} from "../ai-chat-history"

import type { UIMessage } from "ai"

const ITEM_ID = 1

function createTextMessage(
  role: UIMessage["role"],
  text: string,
  id: string
): UIMessage {
  return {
    id,
    parts: [
      {
        state: "done",
        text,
        type: "text"
      }
    ],
    role
  }
}

describe("ai-chat-history", () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetDraftRegistryStore()
  })

  it("should store and restore v2 UIMessage history", () => {
    const messages = [
      createTextMessage("user", "Привет", "user-1"),
      createTextMessage("assistant", "Здравствуйте", "assistant-1")
    ]

    saveAdAiChatHistory(ITEM_ID, messages)

    expect(readAdAiChatHistory(ITEM_ID)).toEqual(messages)
    expect(window.localStorage.getItem(getChatKey(ITEM_ID))).not.toBeNull()
  })
})

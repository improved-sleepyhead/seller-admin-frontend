import { afterEach, describe, expect, it } from "vitest"

import { getApiBaseUrl } from "../runtime-config"

interface RuntimeConfigGlobal {
  APP_CONFIG?: {
    API_BASE_URL?: unknown
  }
  window?: {
    APP_CONFIG?: {
      API_BASE_URL?: unknown
    }
  }
}

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window"
)
const originalAppConfig = (globalThis as RuntimeConfigGlobal).APP_CONFIG

function restoreRuntimeGlobals() {
  if (originalWindowDescriptor) {
    Object.defineProperty(globalThis, "window", originalWindowDescriptor)
  } else {
    Reflect.deleteProperty(globalThis, "window")
  }

  if (originalAppConfig === undefined) {
    Reflect.deleteProperty(globalThis as RuntimeConfigGlobal, "APP_CONFIG")
    return
  }

  ;(globalThis as RuntimeConfigGlobal).APP_CONFIG = originalAppConfig
}

function setGlobalAppConfig(apiBaseUrl: unknown) {
  ;(globalThis as RuntimeConfigGlobal).APP_CONFIG = {
    API_BASE_URL: apiBaseUrl
  }
}

function setWindowAppConfig(apiBaseUrl: unknown) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      APP_CONFIG: {
        API_BASE_URL: apiBaseUrl
      }
    }
  })
}

describe("getApiBaseUrl", () => {
  afterEach(() => {
    restoreRuntimeGlobals()
  })

  it("should return localhost default when runtime config is missing", () => {
    expect(getApiBaseUrl()).toBe("http://localhost:8080")
  })

  it("should read API base url from global app config", () => {
    setGlobalAppConfig("https://api.example.com")

    expect(getApiBaseUrl()).toBe("https://api.example.com")
  })

  it("should prefer window app config over global app config", () => {
    setGlobalAppConfig("https://api.example.com")
    setWindowAppConfig("https://window.example.com")

    expect(getApiBaseUrl()).toBe("https://window.example.com")
  })

  it("should throw for invalid runtime API base url", () => {
    setGlobalAppConfig("not-a-url")

    expect(() => {
      getApiBaseUrl()
    }).toThrowError(/Invalid window\.APP_CONFIG\.API_BASE_URL/)
  })
})

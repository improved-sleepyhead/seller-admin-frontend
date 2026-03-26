import { z } from "zod/v4"

const envSchema = z.object({
  VITE_API_BASE_URL: z.url()
})

function getRawEnvValue(name: string): unknown {
  const env = (import.meta as ImportMeta & { env: Record<string, unknown> }).env
  return env[name]
}

function parseEnv() {
  const result = envSchema.safeParse({
    VITE_API_BASE_URL: getRawEnvValue("VITE_API_BASE_URL")
  })

  if (!result.success) {
    const formatted = z.prettifyError(result.error)
    throw new Error(`Invalid environment variables:\n${formatted}`)
  }

  return result.data
}

export const env = parseEnv()

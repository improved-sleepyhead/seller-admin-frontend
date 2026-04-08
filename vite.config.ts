import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const src = fileURLToPath(new URL('./src', import.meta.url)).replace(/\\/g, '/')
const nodeModulesSegment = '/node_modules/'

function getManualChunk(id: string): string | undefined {
  const normalizedId = id.replace(/\\/g, '/')

  if (!normalizedId.includes(nodeModulesSegment)) {
    return undefined
  }

  if (normalizedId.includes('/node_modules/lodash-es/')) {
    return 'debounce'
  }

  if (
    normalizedId.includes('/node_modules/@tanstack/react-query/') ||
    normalizedId.includes('/node_modules/axios/') ||
    normalizedId.includes('/node_modules/zustand/')
  ) {
    return 'server-state'
  }

  if (
    normalizedId.includes('/node_modules/@hookform/resolvers/') ||
    normalizedId.includes('/node_modules/react-hook-form/') ||
    normalizedId.includes('/node_modules/zod/')
  ) {
    return 'forms'
  }

  if (
    normalizedId.includes('/node_modules/@ai-sdk/') ||
    normalizedId.includes('/node_modules/ai/') ||
    normalizedId.includes('/node_modules/use-stick-to-bottom/')
  ) {
    return 'ai-sdk'
  }

  if (
    normalizedId.includes('/node_modules/@radix-ui/') ||
    normalizedId.includes('/node_modules/lucide-react/') ||
    normalizedId.includes('/node_modules/sonner/') ||
    normalizedId.includes('/node_modules/vaul/')
  ) {
    return 'ui-primitives'
  }

  return undefined
}

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: [
      {
        find: /^@$/,
        replacement: src,
      },
      {
        find: /^@\/(.*)$/,
        replacement: `${src}/$1`,
      },
    ],
    dedupe: ['react', 'react-dom'],
  },

  css: {
    devSourcemap: true,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },

  build: {
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: getManualChunk,
      },
    },
  },
})

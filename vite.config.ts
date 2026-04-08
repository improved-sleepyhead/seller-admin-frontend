import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const src = fileURLToPath(new URL('./src', import.meta.url)).replace(/\\/g, '/')

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
  },
})

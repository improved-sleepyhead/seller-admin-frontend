import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const src = fileURLToPath(new URL('./src', import.meta.url)).replace(/\\/g, '/')

const fsdLayers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']

const fsdAliases = fsdLayers.flatMap((layer) => [
  {
    find: new RegExp(`^${layer}$`),
    replacement: `${src}/${layer}`,
  },
  {
    find: new RegExp(`^${layer}/(.*)$`),
    replacement: `${src}/${layer}/$1`,
  },
])

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
      ...fsdAliases,
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
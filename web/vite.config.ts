import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'
import type { InlineConfig } from 'vitest'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const config: UserConfig & { test: InlineConfig } = {
  plugins: [react()],
  base: '/',
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 300,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/scheduler')) return 'react-vendor'
          if (id.includes('node_modules/react-router')) return 'router-vendor'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
    css: true,
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
  },
}

export default defineConfig(config)

import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'
import type { InlineConfig } from 'vitest'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const config: UserConfig & { test: InlineConfig } = {
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
    css: true,
  },
}

export default defineConfig(config)

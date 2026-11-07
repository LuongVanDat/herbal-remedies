import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: './',
  plugins: [svelte()],
  resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
  },
})

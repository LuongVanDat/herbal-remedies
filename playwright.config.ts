import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:4173/', ...devices['Pixel 7'] },
  webServer: {
    command: 'DATA_DIR=tests/fixtures/valid npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: false,
    timeout: 120000,
  },
})

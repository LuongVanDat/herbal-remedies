import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:4173/', ...devices['Pixel 7'] },
  webServer: {
    // Build bằng dữ liệu mẫu vào dist-e2e rồi khôi phục src/generated bằng dữ liệu thật,
    // để dữ liệu kiểm thử (liều giả) không bao giờ nằm trong dist/ hay src/generated.
    command:
      'DATA_DIR=tests/fixtures/valid npm run data && npx vite build --outDir dist-e2e && npm run data && npx vite preview --outDir dist-e2e --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: false,
    timeout: 120000,
  },
})

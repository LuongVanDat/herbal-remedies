import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: './',
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['apple-touch-icon.png'],
      workbox: { clientsClaim: true, globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'] },
      manifest: {
        name: 'Tra cứu bài thuốc Đông y',
        short_name: 'Bài thuốc',
        description: 'Tra cứu bài thuốc Đông y theo triệu chứng, kèm nguồn văn bản (dùng cá nhân).',
        lang: 'vi',
        display: 'standalone',
        start_url: './',
        scope: './',
        theme_color: '#7a4b14',
        background_color: '#fbfaf7',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
  },
})

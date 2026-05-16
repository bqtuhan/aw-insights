/// <reference types="vite/client" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/aw-insights/',

  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json,woff2}'],
        cleanupOutdatedCaches: true,
        sourcemap: false,
      },
      includeAssets: ['favicon.svg', 'og-image.svg'],
      manifest: {
        name: 'AW Insights — Digital Life Intelligence',
        short_name: 'AW Insights',
        description: 'Transform ActivityWatch exports into world-class analytics. 100% privacy-first, no data leaves your machine.',
        theme_color: '#080d1a',
        background_color: '#080d1a',
        display: 'standalone',
        scope: '/aw-insights/',
        start_url: '/aw-insights/',
        icons: [
          {
            src: '/aw-insights/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/aw-insights/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/aw-insights/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],

  server: {
    port: 5173,
    strictPort: true,
    open: false,
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          recharts: ['recharts'],
          i18n: ['i18next', 'react-i18next'],
          motion: ['motion'],
        },
      },
    },
  },
});
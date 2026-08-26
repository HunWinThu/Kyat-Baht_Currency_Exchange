import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Set VITE_BASE_PATH to your repository name when deploying manually.
// Example: VITE_BASE_PATH=/Kyat-Baht_Currency_Exchange/ npm run build
export default defineConfig(() => {
  const isCapacitor = process.env.CAPACITOR_BUILD === 'true'

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        disable: isCapacitor,
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifest: {
          id: '.',
          name: 'Money Desk by Ktoo',
          short_name: 'Money Desk',
          description: 'Private Thai Baht and Myanmar Kyat exchange desk.',
          start_url: '.',
          scope: '.',
          display: 'standalone',
          display_override: ['standalone'],
          orientation: 'portrait',
          background_color: '#f5f7fb',
          theme_color: '#0f172a',
          categories: ['finance', 'business'],
          icons: [
            {
              src: 'icons/money-desk-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'icons/money-desk-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: 'index.html',
          globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
          globIgnores: ['icons/money-desk-1024.png'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'font-assets',
                expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    // Native Capacitor assets need relative URLs; GitHub Pages needs its repo path.
    base: isCapacitor ? './' : process.env.VITE_BASE_PATH || '/Kyat-Baht_Currency_Exchange/',
  }
})

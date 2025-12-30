import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // 🔒 Offline Fallback
        navigateFallback: '/index.html',
        
        // 🔒 API Caching strategy
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'healthybite-api-cache', // Updated Cache Name
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400 // 24 Hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        // 🏆 NEW BRAND NAME
        name: 'HealthyBite - Smart Food Scanner',
        short_name: 'HealthyBite',
        description: 'Scan food for toxins and allergens instantly.',
        
        // 🎨 NEW BRAND COLORS
        theme_color: '#1DBF73', // Emerald Green
        background_color: '#F7FDFB', // Off-white Mint
        
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      strategies: 'injectManifest',

      injectManifest: {
        swSrc: 'public/sw.js',
        swDest: 'sw.js',
      },
      manifest: false,

      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png',
        'manifest.webmanifest',
      ],
    }),
  ],

  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

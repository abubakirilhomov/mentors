import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        swSrc: 'sw.js',
      },
      manifest: false, // 👈 говорим, что свой манифест лежит в public/
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png',
        'manifest.webmanifest', // 👈 явно добавляем сюда
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
//end
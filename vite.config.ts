import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['image/logo.png'],
        manifest: {
          name: 'BEM STIE WIKARA',
          short_name: 'BEM WIKARA',
          description: 'Aplikasi Resmi BEM STIE WIKARA',
          theme_color: '#0ea5e9',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: '/image/logo.png',
              sizes: '192x192 512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          tentang: path.resolve(__dirname, 'tentang/index.html'),
          lpj: path.resolve(__dirname, 'lpj/index.html'),
          mubes: path.resolve(__dirname, 'mubes/index.html'),
          mubesAgenda: path.resolve(__dirname, 'mubes/agenda/index.html'),
          mubesTor: path.resolve(__dirname, 'mubes/tor/index.html'),
          mubesTartib: path.resolve(__dirname, 'mubes/tartib/index.html'),
          adart: path.resolve(__dirname, 'adart/index.html'),
          install: path.resolve(__dirname, 'install/index.html'),
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

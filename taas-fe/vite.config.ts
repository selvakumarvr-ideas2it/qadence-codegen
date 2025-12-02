import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/dashboard-service': {
        target: 'https://your-api-host',
        changeOrigin: true,
      },
      '/admin-service': {
        target: 'https://your-admin-api-host',
        changeOrigin: true,
      },
    },
  },
});

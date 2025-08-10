// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window', // Polyfill để ánh xạ global thành window
  },
  server: {
    strictPort: true,
    open: true,
    proxy: {
      '/api': {
        target: 'hocho-c7ekfwhrehavd6fr.southeastasia-01.azurewebsites.net',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'hocho-c7ekfwhrehavd6fr.southeastasia-01.azurewebsites.net',
        ws: true,
        changeOrigin: true,
        secure: false
      }
    },
  }
});

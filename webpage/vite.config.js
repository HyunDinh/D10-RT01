// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig ({
  plugins: [react()],
  define: {
    global: 'window', // Polyfill để ánh xạ global thành window
  },
      server: {
        port: 3000, // Cổng mà Vite sẽ chạy
        proxy: {
          '/api': {
            target: 'https://hocho-c7ekfwhrehavd6fr.southeastasia-01.azurewebsites.net',
            changeOrigin: true,
            secure: false,
          },
          '/ws': {
            target: 'https://hocho-c7ekfwhrehavd6fr.southeastasia-01.azurewebsites.net',
            changeOrigin: true,
            secure: false,
          },
        }
      },
    }
)
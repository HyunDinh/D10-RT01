// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,  // 👈 Đổi port tại đây
    strictPort: true,
    open: true   // Tự động mở trình duyệt
  }
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      // 🔧 Remove @ from here entirely
      // Allow live dev from your library source
      'dirk-cfx-react': path.resolve(__dirname, '../dist'), // ✅ use compiled build
      // Fix relative CSS imports inside your library
      './styles': path.resolve(__dirname, '../src/styles'),
    },
  },
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 5000,
  },
});

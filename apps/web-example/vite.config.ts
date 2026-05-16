import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@laddhaanshul/content-renderer': path.resolve(__dirname, '../../packages/react-and-native/src'),
      '@laddhaanshul/content-renderer-core': path.resolve(__dirname, '../../packages/core/src'),
      'react-native': path.resolve(__dirname, 'src/shims/react-native.js'),
    },
  },
  optimizeDeps: {
    exclude: ['react-native'],
  },
  server: {
    port: 3000,
    open: true,
  },
});

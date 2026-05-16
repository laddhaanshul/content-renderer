import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@content-renderer/react-and-native': path.resolve(__dirname, '../../packages/react-and-native/src'),
      '@content-renderer/core': path.resolve(__dirname, '../../packages/core/src'),
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

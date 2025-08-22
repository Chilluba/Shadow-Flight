import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react({
      jsxRuntime: 'automatic'
    })],
    define: {
      // Environment variables for production build
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    },
    server: {
      port: 3000,
      host: true
    },
    preview: {
      port: 3000,
      host: true
    }
  };
});

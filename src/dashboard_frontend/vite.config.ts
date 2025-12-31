import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import react from '@vitejs/plugin-react';

// Dynamically import Tailwind CSS v4 plugin
async function createConfig() {
  const { default: tailwindcss } = await import('@tailwindcss/vite');

  return {
    plugins: [react(), tailwindcss()],
    // Ensure Vite resolves index.html relative to this config file
    root: dirname(fileURLToPath(new URL(import.meta.url))),
    base: '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5002',
          changeOrigin: true,
        },
        '/ws': {
          target: 'ws://localhost:5002',
          ws: true,
        },
      },
    },
  };
}

export default defineConfig(createConfig());



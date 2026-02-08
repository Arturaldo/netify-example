import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  publicDir: 'static',
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        // Только одна точка входа для SPA
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
});

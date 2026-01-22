import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  publicDir: 'static',
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        auth: resolve(__dirname, 'src/pages/auth/index.html'),
        register: resolve(__dirname, 'src/pages/register/index.html'),
        chat: resolve(__dirname, 'src/pages/chat/index.html'),
        profile: resolve(__dirname, 'src/pages/profile/index.html'),
        profileEdit: resolve(__dirname, 'src/pages/profile/edit.html'),
        profilePassword: resolve(__dirname, 'src/pages/profile/password.html'),
        error404: resolve(__dirname, 'src/pages/404/index.html'),
        error500: resolve(__dirname, 'src/pages/500/index.html'),
      },
    },
  },
});

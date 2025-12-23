import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve } from 'path';
import { chatsData, chatPageData } from './src/pages/chat/chatDataMock.js';
import { profileData } from './src/pages/profile/profileMockData.js';

export default defineConfig({
  publicDir: 'static',
  plugins: [
    handlebars({
      context(pagePath) {
        if (pagePath.endsWith('/pages/chat/index.html')) {
          return {
            chats: chatsData,
            currentChat: chatPageData.currentChat,
            messages: chatPageData.messages,

          };
        }
        if (pagePath.endsWith('/pages/profile/index.html')) {
          return profileData;
        }
        if (pagePath.endsWith('/pages/profile/edit.html')) {
          return profileData;
        }
        if (pagePath.endsWith('/pages/profile/password.html')) {
          return profileData;
        }
        return {};
      },
    }),
  ],
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
        404: resolve(__dirname, 'src/pages/404/index.html'),
        500: resolve(__dirname, 'src/pages/500/index.html'),
      },
    },
  },
});

import './assets/scss/collect.scss';
import '../index.scss';
import { router } from './routes';
import { AuthAPI } from './api/AuthAPI';

const PUBLIC_ROUTES = ['/auth', '/register'];

document.addEventListener('DOMContentLoaded', async () => {
  const currentPath = window.location.pathname;

  try {
    await AuthAPI.getUser();

    if (PUBLIC_ROUTES.includes(currentPath) || currentPath === '/') {
      router.start();
      router.go('/chat');
    } else {
      router.start();
    }
  } catch {
    router.start();
    if (!PUBLIC_ROUTES.includes(currentPath)) {
      router.go('/auth');
    }
  }
});

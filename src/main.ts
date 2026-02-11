import './assets/scss/collect.scss';
import '../index.scss';
import { router } from './routes';
import { AuthAPI } from './api/AuthAPI';

const PUBLIC_ROUTES = ['/auth', '/register'];

document.addEventListener('DOMContentLoaded', async () => {
  const currentPath = window.location.pathname;

  try {
    await AuthAPI.getUser();

    // User is authorized — redirect away from public routes
    if (PUBLIC_ROUTES.includes(currentPath) || currentPath === '/') {
      router.start();
      router.go('/chat');
    } else {
      router.start();
    }
  } catch {
    // User is not authorized — redirect to auth
    router.start();
    if (!PUBLIC_ROUTES.includes(currentPath)) {
      router.go('/auth');
    }
  }
});

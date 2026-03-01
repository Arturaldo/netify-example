import { Router } from './core/Router';
import { AuthPage } from './pages/auth/Page';
import { RegisterPage } from './pages/register/Page';
import { ChatPage } from './pages/chat/Page';
import { ProfilePage } from './pages/profile/Page';
import { ProfileEditPage } from './pages/profile/EditPage';
import { ProfilePasswordPage } from './pages/profile/PasswordPage';
import { NotFoundPage } from './pages/404/Page';
import { ServerErrorPage } from './pages/500/Page';

export const router = Router.getInstance('.app');

router
  .use('/auth', AuthPage)
  .use('/register', RegisterPage)
  .use('/chat', ChatPage)
  .use('/profile', ProfilePage)
  .use('/profile/edit', ProfileEditPage)
  .use('/profile/password', ProfilePasswordPage)
  .use('/404', NotFoundPage)
  .use('/500', ServerErrorPage);

window.addEventListener('navigate', ((event: CustomEvent) => {
  const path = event.detail;
  router.go(path);
}) as EventListener);

export default router;

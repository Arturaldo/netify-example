import { Router } from './core/Router';
import { AuthPage } from './pages/auth/Page';
import { RegisterPage } from './pages/register/Page';
import { ChatPage } from './pages/chat/Page';
import { ProfilePage } from './pages/profile/Page';
import { ProfileEditPage } from './pages/profile/EditPage';
import { ProfilePasswordPage } from './pages/profile/PasswordPage';
import { NotFoundPage } from './pages/404/Page';
import { ServerErrorPage } from './pages/500/Page';

/**
 * Инициализация и настройка роутера приложения
 *
 * Этот файл отвечает за:
 * 1. Создание экземпляра роутера (Singleton)
 * 2. Регистрацию всех маршрутов приложения через паттерн Builder
 * 3. Настройку обработчика кастомного события 'navigate' для программной навигации
 * 4. Экспорт настроенного роутера для использования в других частях приложения
 *
 * ИСПОЛЬЗОВАНИЕ ПАТТЕРНА BUILDER:
 * ================================
 * Все маршруты регистрируются цепочкой вызовов метода use(),
 * что делает код читаемым и декларативным.
 * Каждый вызов use() возвращает экземпляр роутера, позволяя продолжить цепочку.
 */

/**
 * Создаем и настраиваем роутер
 *
 * Router.getInstance() гарантирует, что будет создан только один экземпляр (Singleton).
 * Передаем '.app' как корневой селектор, куда будут рендериться страницы.
 */
export const router = Router.getInstance('.app');

/**
 * Регистрируем все маршруты приложения
 *
 * Паттерн Builder позволяет писать это как цепочку вызовов:
 * router.use(...).use(...).use(...)
 *
 * Каждый маршрут связывает:
 * - URL путь (например '/auth')
 * - Класс страницы (например AuthPage)
 *
 * При переходе на URL роутер создаст экземпляр соответствующей страницы
 * и отрисует её в корневой элемент (.app)
 */
router
  // Главная страница - редирект на авторизацию
  .use('/', AuthPage)
  // Страницы аутентификации
  .use('/auth', AuthPage)
  .use('/register', RegisterPage)
  // Основные страницы приложения
  .use('/chat', ChatPage)
  .use('/profile', ProfilePage)
  .use('/profile/edit', ProfileEditPage)
  .use('/profile/password', ProfilePasswordPage)
  // Страницы ошибок
  .use('/404', NotFoundPage)
  .use('/500', ServerErrorPage);

/**
 * Настройка глобального обработчика навигации
 *
 * Компоненты могут инициировать навигацию через кастомное событие:
 * window.dispatchEvent(new CustomEvent('navigate', { detail: '/path' }))
 *
 * Это позволяет компонентам выполнять навигацию без прямого импорта роутера,
 * что улучшает разделение ответственности и тестируемость.
 *
 * Пример использования в компоненте:
 * ```
 * button.addEventListener('click', () => {
 *   window.dispatchEvent(new CustomEvent('navigate', { detail: '/profile' }));
 * });
 * ```
 */
window.addEventListener('navigate', ((event: CustomEvent) => {
  const path = event.detail;
  router.go(path);
}) as EventListener);

/**
 * Экспорт настроенного роутера
 *
 * Хотя навигацию рекомендуется выполнять через событие 'navigate',
 * в некоторых случаях может потребоваться прямой доступ к роутеру:
 *
 * ```
 * import { router } from './routes';
 * router.go('/profile');
 * router.back();
 * ```
 */
export default router;

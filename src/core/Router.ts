import { Block } from './Block';
import { Route } from './Route';

/**
 * Класс Router управляет навигацией в Single Page Application (SPA)
 *
 * ПАТТЕРН SINGLETON (Одиночка):
 * =============================
 * Router реализован как Singleton, потому что:
 * 1. В приложении должен быть только один роутер
 * 2. Роутер управляет глобальным состоянием навигации
 * 3. Множественные экземпляры роутера создадут конфликты при обработке истории браузера
 *
 * При попытке создать второй экземпляр через `new Router()`,
 * конструктор вернет первый созданный экземпляр (из __instance)
 *
 * ПАТТЕРН BUILDER (Строитель):
 * =============================
 * Метод use() возвращает this, что позволяет использовать цепочку вызовов:
 *
 * router
 *   .use('/chat', ChatPage)
 *   .use('/profile', ProfilePage)
 *   .use('/login', LoginPage)
 *   .start();
 *
 * Это делает код более читаемым и удобным при настройке роутов.
 *
 * ПРИНЦИП РАБОТЫ:
 * ===============
 * 1. Router хранит список всех зарегистрированных маршрутов (routes)
 * 2. При изменении URL (через history API или кнопки браузера) вызывается _onRoute()
 * 3. _onRoute() находит подходящий маршрут и отрисовывает соответствующую страницу
 * 4. Метод go() позволяет программно менять URL без перезагрузки страницы
 */
export class Router {
  // Статическое поле для хранения единственного экземпляра (Singleton)
  private static __instance: Router | null = null;

  // Список всех зарегистрированных маршрутов
  private routes: Route[] = [];

  // История браузера для управления навигацией
  private history: History = window.history;

  // Текущий активный маршрут (для возможности вызвать leave() при переходе)
  private _currentRoute: Route | null = null;

  // Корневой селектор, куда будут рендериться страницы
  private _rootQuery: string = '.app';

  /**
   * Конструктор реализует паттерн Singleton
   *
   * Если экземпляр уже существует, возвращает его вместо создания нового.
   * Это гарантирует, что в приложении будет только один роутер.
   *
   * @param rootQuery - CSS селектор корневого элемента (по умолчанию '.app')
   */
  constructor(rootQuery: string = '.app') {
    // Проверяем, существует ли уже экземпляр
    if (Router.__instance) {
      // Если да, возвращаем существующий (паттерн Singleton)
      return Router.__instance;
    }

    // Инициализируем поля
    this.routes = [];
    this.history = window.history;
    this._currentRoute = null;
    this._rootQuery = rootQuery;

    // Сохраняем ссылку на созданный экземпляр
    Router.__instance = this;
  }

  /**
   * Регистрирует новый маршрут в роутере
   *
   * Возвращает this для реализации паттерна Builder (цепочка вызовов).
   * Это позволяет писать красивый и читаемый код:
   *
   * router
   *   .use('/chat', ChatPage)
   *   .use('/profile', ProfilePage);
   *
   * @param pathname - путь маршрута, например "/chat", "/profile"
   * @param block - класс Block (страница), которая будет отрисована
   * @returns this - текущий экземпляр роутера для цепочки вызовов
   */
  use(pathname: string, block: new () => Block): Router {
    // Создаем новый Route с переданными параметрами
    const route = new Route(pathname, block, { rootQuery: this._rootQuery });

    // Добавляем маршрут в список
    this.routes.push(route);

    // Возвращаем this — основа паттерна Builder («Строитель»)
    // Это позволяет вызывать методы цепочкой: router.use(...).use(...).start()
    return this;
  }

  /**
   * Запускает роутер и начинает слушать изменения URL
   *
   * Должен вызываться после регистрации всех маршрутов через use().
   * Подписывается на события браузера (кнопки Назад/Вперед) и
   * выполняет первоначальную отрисовку страницы.
   */
  start(): void {
    // Подписываемся на событие popstate (кнопки Назад/Вперед в браузере)
    // При нажатии на эти кнопки браузер меняет URL и вызывает это событие
    window.onpopstate = (event: PopStateEvent) => {
      const target = event.currentTarget as Window;
      // Вызываем обработчик маршрута с новым pathname
      this._onRoute(target.location.pathname);
    };

    // Выполняем первоначальную отрисовку для текущего URL
    this._onRoute(window.location.pathname);
  }

  /**
   * Обрабатывает переход на указанный путь
   *
   * Это внутренний метод, который:
   * 1. Находит подходящий маршрут
   * 2. Вызывает leave() у предыдущего маршрута (если был)
   * 3. Отрисовывает новый маршрут
   *
   * @param pathname - путь, на который нужно перейти
   */
  private _onRoute(pathname: string): void {
    // Ищем маршрут, соответствующий переданному пути
    const route = this.getRoute(pathname);

    // Если маршрут не найден, выходим
    // Можно добавить редирект на страницу 404
    if (!route) {
      console.warn(`Route not found for pathname: ${pathname}`);
      return;
    }

    // Если есть текущий активный маршрут, вызываем у него leave()
    // Это позволяет выполнить очистку (удалить подписки, таймеры и т.д.)
    if (this._currentRoute && this._currentRoute !== route) {
      this._currentRoute.leave();
    }

    // Сохраняем новый маршрут как текущий
    this._currentRoute = route;

    // Отрисовываем страницу нового маршрута
    route.render();
  }

  /**
   * Программно переходит на указанный путь
   *
   * Используется для навигации из кода (например, при клике на ссылку).
   * Добавляет новую запись в историю браузера через pushState,
   * что позволяет пользователю вернуться назад через кнопку браузера.
   *
   * Пример использования:
   * ```
   * router.go('/profile');
   * ```
   *
   * @param pathname - путь, на который нужно перейти
   */
  go(pathname: string): void {
    // Добавляем новую запись в историю браузера
    // pushState меняет URL без перезагрузки страницы
    // Первый аргумент {} - state (дополнительные данные, здесь не используются)
    // Второй аргумент "" - title (устарел, можно оставить пустым)
    // Третий аргумент - новый URL
    this.history.pushState({}, '', pathname);

    // Вызываем обработчик для отрисовки новой страницы
    this._onRoute(pathname);
  }

  /**
   * Переходит назад в истории браузера
   *
   * Эквивалентно нажатию кнопки "Назад" в браузере
   */
  back(): void {
    this.history.back();
  }

  /**
   * Переходит вперед в истории браузера
   *
   * Эквивалентно нажатию кнопки "Вперед" в браузере
   */
  forward(): void {
    this.history.forward();
  }

  /**
   * Находит и возвращает маршрут, соответствующий переданному пути
   *
   * Использует метод match() каждого Route для проверки соответствия.
   * Можно расширить для поддержки параметризованных маршрутов (например /user/:id)
   *
   * @param pathname - путь для поиска
   * @returns Route или undefined, если маршрут не найден
   */
  getRoute(pathname: string): Route | undefined {
    return this.routes.find((route) => route.match(pathname));
  }

  /**
   * Статический метод для получения экземпляра роутера (Singleton)
   *
   * Удобный способ получить роутер из любого места в коде:
   * ```
   * const router = Router.getInstance();
   * router.go('/profile');
   * ```
   *
   * @returns единственный экземпляр Router
   */
  static getInstance(rootQuery?: string): Router {
    if (!Router.__instance) {
      Router.__instance = new Router(rootQuery);
    }
    return Router.__instance;
  }

  /**
   * Сбрасывает синглтон (для тестирования)
   *
   * В обычном приложении не используется.
   * Нужен только для unit-тестов, чтобы создавать чистый экземпляр роутера.
   */
  static resetInstance(): void {
    Router.__instance = null;
  }
}

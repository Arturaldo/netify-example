import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Router } from './Router';
import { Block } from './Block';

class StubPage extends Block {
  constructor() {
    super('div', {});
  }

  protected render(): string {
    return '<div>Page</div>';
  }
}

describe('Router', () => {
  beforeEach(() => {
    Router.resetInstance();
    document.body.innerHTML = '<div class="app"></div>';
  });

  afterEach(() => {
    Router.resetInstance();
    vi.restoreAllMocks();
  });

  describe('Singleton', () => {
    it('возвращает один и тот же экземпляр при повторном создании', () => {
      const r1 = new Router('.app');
      const r2 = new Router('.app');
      expect(r1).toBe(r2);
    });

    it('getInstance() возвращает тот же экземпляр', () => {
      const r1 = new Router('.app');
      const r2 = Router.getInstance();
      expect(r1).toBe(r2);
    });

    it('после resetInstance() создаётся новый экземпляр', () => {
      const r1 = new Router('.app');
      Router.resetInstance();
      const r2 = new Router('.app');
      expect(r1).not.toBe(r2);
    });
  });

  describe('use()', () => {
    it('добавляет маршрут и возвращает роутер для чейнинга', () => {
      const router = new Router('.app');
      const result = router.use('/test', StubPage);
      expect(result).toBe(router);
    });

    it('поддерживает добавление нескольких маршрутов', () => {
      const router = new Router('.app');
      router.use('/', StubPage).use('/login', StubPage).use('/chat', StubPage);
      expect(router.getRoute('/')).toBeDefined();
      expect(router.getRoute('/login')).toBeDefined();
      expect(router.getRoute('/chat')).toBeDefined();
    });
  });

  describe('getRoute()', () => {
    it('находит маршрут по pathname', () => {
      const router = new Router('.app');
      router.use('/profile', StubPage);
      const route = router.getRoute('/profile');
      expect(route).toBeDefined();
    });

    it('возвращает undefined для несуществующего пути', () => {
      const router = new Router('.app');
      router.use('/', StubPage);
      const route = router.getRoute('/unknown');
      expect(route).toBeUndefined();
    });

    it('возвращает правильный маршрут из нескольких', () => {
      const router = new Router('.app');
      router.use('/a', StubPage);
      router.use('/b', StubPage);
      const route = router.getRoute('/b');
      expect(route?.pathname).toBe('/b');
    });
  });

  describe('go()', () => {
    it('вызывает history.pushState с нужным pathname', () => {
      const pushStateSpy = vi.spyOn(window.history, 'pushState');
      const router = new Router('.app');
      router.use('/login', StubPage);
      router.go('/login');
      expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/login');
    });

    it('переходит на зарегистрированный маршрут без ошибок', () => {
      const router = new Router('.app');
      router.use('/chat', StubPage);
      expect(() => router.go('/chat')).not.toThrow();
    });

    it('выводит предупреждение при переходе на незарегистрированный путь', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const router = new Router('.app');
      router.go('/nonexistent');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('/nonexistent'),
      );
    });
  });

  describe('back() / forward()', () => {
    it('вызывает history.back()', () => {
      const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      const router = new Router('.app');
      router.back();
      expect(backSpy).toHaveBeenCalled();
    });

    it('вызывает history.forward()', () => {
      const forwardSpy = vi.spyOn(window.history, 'forward').mockImplementation(() => {});
      const router = new Router('.app');
      router.forward();
      expect(forwardSpy).toHaveBeenCalled();
    });
  });
});

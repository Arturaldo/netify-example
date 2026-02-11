import { Block } from './Block';

/**
 * Класс Route представляет собой отдельный маршрут в приложении.
 *
 * Каждый маршрут знает:
 * - Свой путь (pathname), например "/chat" или "/profile"
 * - Какой Block (страницу) нужно отрисовать
 * - Как проверить, соответствует ли текущий URL этому маршруту
 *
 * Основные методы:
 * - match(pathname) - проверяет, соответствует ли переданный путь маршруту
 * - render() - отрисовывает соответствующий Block
 * - leave() - выполняет очистку перед уходом с маршрута
 */
export class Route {
  private _pathname: string;
  private _blockClass: new () => Block;
  private _block: Block | null;
  private _props: { rootQuery: string };

  /**
   * @param pathname - путь маршрута, например "/chat", "/profile"
   * @param view - класс Block, который будет отрисован на этом маршруте
   * @param props - дополнительные свойства (rootQuery - селектор корневого элемента)
   */
  constructor(pathname: string, view: new () => Block, props: { rootQuery: string }) {
    this._pathname = pathname;
    this._blockClass = view;
    this._block = null;
    this._props = props;
  }

  /**
   * Проверяет, соответствует ли переданный путь этому маршруту
   *
   * Используется роутером для определения, какой маршрут активировать.
   * Можно расширить для поддержки параметров в URL (например /user/:id)
   *
   * @param pathname - текущий путь из адресной строки
   * @returns true, если путь соответствует маршруту
   */
  match(pathname: string): boolean {
    return pathname === this._pathname;
  }

  /**
   * Отрисовывает Block, связанный с этим маршрутом
   *
   * Создает экземпляр Block (если еще не создан) и вставляет его в DOM.
   * Используется роутером при переходе на этот маршрут.
   */
  render(): void {
    // Создаем новый экземпляр Block при каждом переходе,
    // чтобы данные загружались заново из API
    this._block = new this._blockClass();

    // Находим корневой элемент в DOM
    const root = document.querySelector(this._props.rootQuery);

    if (root) {
      // Очищаем содержимое корневого элемента
      root.innerHTML = '';

      // Вставляем наш Block
      const content = this._block.getContent();
      if (content) {
        root.appendChild(content);
      }

      // Вызываем lifecycle-метод компонента
      this._block.dispatchComponentDidMount();
    }
  }

  /**
   * Выполняет очистку при уходе с маршрута
   *
   * Вызывается роутером перед переходом на другой маршрут.
   * Здесь можно добавить логику очистки подписок, таймеров и т.д.
   */
  leave(): void {
    if (this._block) {
      // Скрываем Block вместо удаления для возможного переиспользования
      this._block.hide();
    }
  }

  /**
   * Геттер для получения пути маршрута
   * Полезно для отладки и логирования
   */
  get pathname(): string {
    return this._pathname;
  }
}

import { Block } from '../../core/Block';
import { Link } from '../../components/Link';
import '../../assets/scss/collect.scss';
import './index.scss';

/**
 * Страница 500 - отображается при внутренних ошибках сервера
 */
export class ServerErrorPage extends Block {
  private linkToChat: Link;

  constructor() {
    super('main');

    // Создаем ссылку на страницу чата
    this.linkToChat = new Link({
      text: 'Назад к чатам',
      href: '/chat',
      className: 'error-page__link',
      events: {
        click: (e: Event) => {
          e.preventDefault();
          // Используем роутер для навигации
          window.dispatchEvent(new CustomEvent('navigate', { detail: '/chat' }));
        },
      },
    });
  }

  protected init(): void {
    if (this.element) {
      this.element.className = 'error-page';
    }
  }

  protected componentDidMount(): void {
    // Вставляем ссылку в DOM после монтирования
    const linkPlaceholder = this.element?.querySelector('[data-link]');
    if (linkPlaceholder && this.linkToChat.getContent()) {
      linkPlaceholder.replaceWith(this.linkToChat.getContent()!);
      this.linkToChat.dispatchComponentDidMount();
    }
  }

  render(): string {
    return `
      <h1 class="error-page__code">500</h1>
      <p class="error-page__text">Мы уже фиксим</p>
      <div data-link></div>
    `;
  }
}

import { Block } from '../../core/Block';
import { Link } from '../../components/Link';

const NAV_LINKS = [
  { text: 'Вход', href: '/auth' },
  { text: 'Регистрация', href: '/register' },
  { text: 'Чат', href: '/chat' },
  { text: 'Настройки пользователя', href: '/profile' },
  { text: '404', href: '/404' },
  { text: '500', href: '/500' },
];

export class MainPage extends Block {
  private links: Link[] = [];

  constructor() {
    super('main');

    this.links = NAV_LINKS.map(
      ({ text, href }) =>
        new Link({
          text,
          href,
          className: 'main-page__container__form__submit',
          events: {
            click: (e: Event) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('navigate', { detail: href }));
            },
          },
        }),
    );
  }

  protected init(): void {
    if (this.element) {
      this.element.className = 'main-page__container';
    }
  }

  protected componentDidMount(): void {
    const nav = this.element?.querySelector('[data-nav]');
    if (!nav) return;

    this.links.forEach((link) => {
      const content = link.getContent();
      if (content) {
        nav.appendChild(content);
        link.dispatchComponentDidMount();
      }
    });
  }

  render(): string {
    return `
      <h1>Мессенджер</h1>
      <nav class="main-page__container__form" data-nav></nav>
    `;
  }
}

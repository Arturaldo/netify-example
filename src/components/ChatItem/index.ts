import { Block, BlockProps } from '../../core/Block';

export interface ChatItemProps extends BlockProps {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string | null;
  unreadCount?: number;
  isActive?: boolean;
  onClick?: (id: string) => void;
}

/**
 * Компонент элемента чата в списке.
 * Демонстрирует использование Handlebars для условного рендеринга.
 */
export class ChatItem extends Block<ChatItemProps> {
  constructor(props: ChatItemProps) {
    super('a', {
      ...props,
      events: {
        click: (e: Event) => {
          e.preventDefault();
          if (props.onClick) {
            props.onClick(props.id);
          }
        },
      },
    });
  }

  protected init(): void {
    if (this.element) {
      this.element.className = 'left-bar__content__mini-chat';
      this.element.setAttribute('href', '#');

      if (this.props.isActive) {
        this.element.classList.add('left-bar__content__mini-chat--active');
      }
    }
  }

  /**
   * Handlebars шаблон с условными блоками.
   * {{#if avatar}} — условный рендеринг
   * {{ name }} — экранированный вывод (безопасно от XSS)
   * {{{ avatarHtml }}} — неэкранированный HTML (используем для заранее подготовленного HTML)
   */
  render(): DocumentFragment {
    const { name, lastMessage, time, avatar, unreadCount } = this.props;

    return this.compile(
      `
      <div class="left-bar__content__mini-chat__avatar">
        {{#if avatar}}
          <img src="{{ avatar }}" alt="Аватар пользователя {{ name }}">
        {{else}}
          <span class="avatar-placeholder" aria-label="Аватар по умолчанию для {{ name }}"></span>
        {{/if}}
      </div>
      <div class="left-bar__content__mini-chat__body">
        <div class="left-bar__content__mini-chat__name {{#if unreadCount}}left-bar__content__mini-chat__name--unread{{/if}}">
          {{ name }}
        </div>
        <div class="left-bar__content__mini-chat__last">
          {{ lastMessage }}
        </div>
      </div>
      <div class="left-bar__content__mini-chat__right">
        <div class="left-bar__content__mini-chat__time">{{ time }}</div>
        {{#if unreadCount}}
          <div class="left-bar__content__mini-chat__badge">{{ unreadCount }}</div>
        {{/if}}
      </div>
    `,
      { name, lastMessage, time, avatar, unreadCount }
    );
  }
}

import { Block, BlockProps, render } from '../../core/Block';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { validate } from '../../utils/validation';
import { chatsData, chatPageData, Chat, Message } from './chatDataMock';
import '../../assets/scss/collect.scss';
import './index.scss';

interface MessageFormProps extends BlockProps {
  onSubmit?: (message: string) => void;
}

class MessageForm extends Block<MessageFormProps> {
  private messageInput: Input;
  private sendButton: Button;

  constructor(props: MessageFormProps) {
    super('form', {
      ...props,
      events: {
        submit: (e: Event) => this._handleSubmit(e),
      },
    });

    this.messageInput = new Input({
      name: 'message',
      type: 'text',
      placeholder: 'Сообщение',
      validationType: 'message',
      className: 'chat__input-field-wrapper',
    });

    this.sendButton = new Button({
      text: '➤',
      type: 'submit',
      className: 'chat__input-send',
    });
  }

  protected init(): void {
    if (this.element) {
      this.element.className = 'chat__input';
      this.element.setAttribute('autocomplete', 'off');
    }
  }

  private _handleSubmit(e: Event): void {
    e.preventDefault();

    const value = this.messageInput.getValue();
    const result = validate('message', value);

    if (result.isValid) {
      console.log('Отправка сообщения:', { message: value });
      if (this.props.onSubmit) {
        this.props.onSubmit(value);
      }
      this.messageInput.setValue('');
    } else {
      this.messageInput.validate();
    }
  }

  protected componentDidMount(): void {
    const inputPlaceholder = this.element?.querySelector('[data-message-input]');
    if (inputPlaceholder && this.messageInput.getContent()) {
      inputPlaceholder.replaceWith(this.messageInput.getContent()!);
    }

    const buttonPlaceholder = this.element?.querySelector('[data-send-button]');
    if (buttonPlaceholder && this.sendButton.getContent()) {
      buttonPlaceholder.replaceWith(this.sendButton.getContent()!);
    }
  }

  render(): string {
    return `
      <div data-message-input></div>
      <div data-send-button></div>
    `;
  }
}

function renderChatItem(chat: Chat): string {
  const activeClass = chat.isActive ? 'left-bar__content__mini-chat--active' : '';
  const unreadClass = chat.unreadCount ? 'left-bar__content__mini-chat__name--unread' : '';

  return `
    <a href="#" class="left-bar__content__mini-chat ${activeClass}">
      <div class="left-bar__content__mini-chat__avatar">
        ${chat.avatar
          ? `<img src="${chat.avatar}" alt="Аватар пользователя ${chat.name}">`
          : `<span class="avatar-placeholder" aria-label="Аватар по умолчанию для ${chat.name}"></span>`
        }
      </div>
      <div class="left-bar__content__mini-chat__body">
        <div class="left-bar__content__mini-chat__name ${unreadClass}">
          ${chat.name}
        </div>
        <div class="left-bar__content__mini-chat__last">
          ${chat.lastMessage}
        </div>
      </div>
      <div class="left-bar__content__mini-chat__right">
        <div class="left-bar__content__mini-chat__time">${chat.time}</div>
        ${chat.unreadCount ? `<div class="left-bar__content__mini-chat__badge">${chat.unreadCount}</div>` : ''}
      </div>
    </a>
  `;
}

function renderMessage(message: Message): string {
  const directionClass = message.isOutgoing ? 'message--outgoing' : 'message--incoming';
  const mediaClass = message.image ? 'message__bubble--media' : '';

  let content = '';
  if (message.text) {
    content += message.text;
  }
  if (message.image) {
    content += `<img src="${message.image}" alt="${message.imageAlt || ''}" class="message__image">`;
  }

  let meta = '';
  if (message.isOutgoing) {
    meta = `
      <div class="message__meta">
        ${message.status ? `<span class="message__status">${message.status}</span>` : ''}
        <span class="message__time">${message.time}</span>
      </div>
    `;
  } else {
    meta = `<div class="message__time">${message.time}</div>`;
  }

  return `
    <div class="message ${directionClass}">
      <div class="message__bubble ${mediaClass}">
        ${content}
      </div>
      ${meta}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('.app');
  if (!app) return;

  const chatListHtml = chatsData.map(renderChatItem).join('');
  const messagesHtml = chatPageData.messages.map(renderMessage).join('');

  app.innerHTML = `
    <main class="chat__container">
      <aside class="chat__container__left-bar">
        <header class="chat__container__left-bar__top-bar">
          <a href="../profile/index.html" class="top-bar__profile">
            <span class="display-secondary font-weight-b">Профиль</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 2l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </a>
          <div class="top-bar__search">
            <input class="top-bar__search__input" type="text" placeholder="Поиск">
          </div>
        </header>

        <section class="chat__container__left-bar__content scrollable">
          ${chatListHtml}
        </section>
      </aside>

      <section class="chat__container__chat-content">
        <header class="chat__container__chat-content__header">
          <div class="chat__chat-header-left">
            <div class="chat__chat-avatar"></div>
            <div class="chat__chat-name">${chatPageData.currentChat.name}</div>
          </div>
          <button class="chat__chat-menu" type="button">⋮</button>
        </header>

        <div class="chat__chat-date">${chatPageData.currentChat.date}</div>

        <article class="chat__container__chat-content__mini-chat">
          ${messagesHtml}
        </article>

        <footer class="chat__message-form-container"></footer>
      </section>
    </main>
  `;

  const messageForm = new MessageForm({
    onSubmit: (message) => {
      console.log('Сообщение отправлено:', message);
    },
  });

  render('.chat__message-form-container', messageForm);
  messageForm.dispatchComponentDidMount();
});

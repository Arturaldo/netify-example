import { Block, BlockProps } from '../../core/Block';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { validate } from '../../utils/validation';
import { ChatAPI, ChatData } from '../../api/ChatAPI';
import { AuthAPI, UserData } from '../../api/AuthAPI';
import { UserAPI } from '../../api/UserAPI';
import { WebSocketTransport, WSMessage } from '../../core/WebSocketTransport';
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

export class ChatPage extends Block {
  private messageForm: MessageForm;
  private chats: ChatData[] = [];
  private activeChatId: number | null = null;
  private ws: WebSocketTransport | null = null;
  private currentUser: UserData | null = null;
  private messages: WSMessage[] = [];

  constructor() {
    super('main');

    this.messageForm = new MessageForm({
      onSubmit: (message) => {
        this._sendMessage(message);
      },
    });
  }

  protected init(): void {
    if (this.element) {
      this.element.className = 'chat__container';
    }
  }

  private _sendMessage(content: string): void {
    if (this.ws) {
      this.ws.send(content);
    }
  }

  private _formatTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  private renderChatItem(chat: ChatData): string {
    const activeClass = chat.id === this.activeChatId ? 'left-bar__content__mini-chat--active' : '';
    const unreadClass = chat.unread_count ? 'left-bar__content__mini-chat__name--unread' : '';
    const lastMsg = chat.last_message?.content || '';
    const time = chat.last_message ? this._formatTime(chat.last_message.time) : '';

    return `
      <a href="#" class="left-bar__content__mini-chat ${activeClass}" data-chat-id="${chat.id}">
        <div class="left-bar__content__mini-chat__avatar">
          <span class="avatar-placeholder"></span>
        </div>
        <div class="left-bar__content__mini-chat__body">
          <div class="left-bar__content__mini-chat__name ${unreadClass}">
            ${chat.title}
          </div>
          <div class="left-bar__content__mini-chat__last">
            ${lastMsg}
          </div>
        </div>
        <div class="left-bar__content__mini-chat__right">
          <div class="left-bar__content__mini-chat__time">${time}</div>
          ${chat.unread_count ? `<div class="left-bar__content__mini-chat__badge">${chat.unread_count}</div>` : ''}
        </div>
      </a>
    `;
  }

  private renderMessage(msg: WSMessage): string {
    if (!this.currentUser) return '';
    const isOutgoing = msg.user_id === this.currentUser.id;
    const directionClass = isOutgoing ? 'message--outgoing' : 'message--incoming';
    const time = msg.time ? this._formatTime(msg.time) : '';

    return `
      <div class="message ${directionClass}">
        <div class="message__bubble">
          ${msg.content}
        </div>
        <div class="message__time">${time}</div>
      </div>
    `;
  }

  private _updateChatList(): void {
    const listEl = this.element?.querySelector('.left-bar__content');
    if (listEl) {
      listEl.innerHTML = this.chats.map((c) => this.renderChatItem(c)).join('');
      this._bindChatClicks();
    }
  }

  private _updateMessages(): void {
    const messagesEl = this.element?.querySelector('.chat__container__chat-content__mini-chat');
    if (messagesEl) {
      messagesEl.innerHTML = this.messages.map((m) => this.renderMessage(m)).join('');
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  private _updateChatHeader(): void {
    const chat = this.chats.find((c) => c.id === this.activeChatId);
    const nameEl = this.element?.querySelector('.chat__chat-name');
    if (nameEl) {
      nameEl.textContent = chat ? chat.title : '';
    }
  }

  private _bindChatClicks(): void {
    const chatItems = this.element?.querySelectorAll('[data-chat-id]');
    chatItems?.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const chatId = Number((item as HTMLElement).dataset.chatId);
        if (chatId && chatId !== this.activeChatId) {
          this._selectChat(chatId);
        }
      });
    });
  }

  private async _selectChat(chatId: number): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.activeChatId = chatId;
    this.messages = [];
    this._updateChatList();
    this._updateChatHeader();
    this._updateMessages();

    const chatContent = this.element?.querySelector('.chat__container__chat-content') as HTMLElement;
    if (chatContent) {
      chatContent.style.display = '';
    }
    const placeholder = this.element?.querySelector('.chat__placeholder') as HTMLElement;
    if (placeholder) {
      placeholder.style.display = 'none';
    }

    if (!this.currentUser) return;

    try {
      const { token } = await ChatAPI.getChatToken(chatId);
      this.ws = new WebSocketTransport(this.currentUser.id, chatId, token);

      this.ws.onMessage = (data) => {
        if (Array.isArray(data)) {
          this.messages = data.reverse();
          this._updateMessages();
        } else if (data.type === 'message') {
          this.messages.push(data);
          this._updateMessages();
        }
      };

      await this.ws.connect();
      this.ws.getOldMessages(0);
    } catch (error) {
      console.error('Ошибка подключения к чату:', error);
    }
  }

  private _bindCreateChat(): void {
    const createBtn = this.element?.querySelector('[data-create-chat]');
    createBtn?.addEventListener('click', async () => {
      const title = prompt('Название нового чата:');
      if (title) {
        try {
          await ChatAPI.createChat(title);
          this.chats = await ChatAPI.getChats();
          this._updateChatList();
        } catch (error) {
          console.error('Ошибка создания чата:', error);
        }
      }
    });
  }

  private _bindAddUser(): void {
    const addBtn = this.element?.querySelector('[data-add-user]');
    addBtn?.addEventListener('click', async () => {
      if (!this.activeChatId) return;
      const login = prompt('Логин пользователя для добавления:');
      if (login) {
        try {
          const users = await UserAPI.searchUsers(login);
          if (users.length > 0) {
            await ChatAPI.addUsers(this.activeChatId, [users[0].id]);
            alert(`Пользователь ${users[0].login} добавлен в чат`);
          } else {
            alert('Пользователь не найден');
          }
        } catch (error) {
          console.error('Ошибка добавления пользователя:', error);
        }
      }
    });
  }

  private _bindRemoveUser(): void {
    const removeBtn = this.element?.querySelector('[data-remove-user]');
    removeBtn?.addEventListener('click', async () => {
      if (!this.activeChatId) return;
      const login = prompt('Логин пользователя для удаления:');
      if (login) {
        try {
          const users = await UserAPI.searchUsers(login);
          if (users.length > 0) {
            await ChatAPI.removeUsers(this.activeChatId, [users[0].id]);
            alert(`Пользователь ${users[0].login} удалён из чата`);
          } else {
            alert('Пользователь не найден');
          }
        } catch (error) {
          console.error('Ошибка удаления пользователя:', error);
        }
      }
    });
  }

  protected async componentDidMount(): Promise<void> {
    const profileLink = this.element?.querySelector('.top-bar__profile');
    if (profileLink) {
      profileLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('navigate', { detail: '/profile' }));
      });
    }

    const messageFormContainer = this.element?.querySelector('.chat__message-form-container');
    if (messageFormContainer && this.messageForm.getContent()) {
      messageFormContainer.appendChild(this.messageForm.getContent()!);
      this.messageForm.dispatchComponentDidMount();
    }

    this._bindCreateChat();
    this._bindAddUser();
    this._bindRemoveUser();

    try {
      this.currentUser = await AuthAPI.getUser();
      this.chats = await ChatAPI.getChats();
      this._updateChatList();
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  }

  render(): string {
    return `
      <aside class="chat__container__left-bar">
        <header class="chat__container__left-bar__top-bar">
          <a href="/profile" class="top-bar__profile">
            <span class="display-secondary font-weight-b">Профиль</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 2l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </a>
          <div class="top-bar__search">
            <input class="top-bar__search__input" type="text" placeholder="Поиск">
          </div>
          <button class="top-bar__create-chat" data-create-chat type="button">+ Новый чат</button>
        </header>

        <section class="chat__container__left-bar__content left-bar__content scrollable">
        </section>
      </aside>

      <div class="chat__placeholder">
        <p>Выберите чат, чтобы отправить сообщение</p>
      </div>

      <section class="chat__container__chat-content" style="display:none;">
        <header class="chat__container__chat-content__header">
          <div class="chat__chat-header-left">
            <div class="chat__chat-avatar"></div>
            <div class="chat__chat-name"></div>
          </div>
          <div class="chat__chat-actions">
            <button class="chat__chat-action-btn" data-add-user type="button" title="Добавить пользователя">+👤</button>
            <button class="chat__chat-action-btn" data-remove-user type="button" title="Удалить пользователя">-👤</button>
          </div>
        </header>

        <article class="chat__container__chat-content__mini-chat">
        </article>

        <footer class="chat__message-form-container"></footer>
      </section>
    `;
  }
}

import { Block, BlockProps } from '../../core/Block';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { validate } from '../../utils/validation';
import { ChatAPI, ChatData } from '../../api/ChatAPI';
import { AuthAPI, UserData } from '../../api/AuthAPI';
import { UserAPI } from '../../api/UserAPI';
import { WebSocketTransport, WSMessage } from '../../core/WebSocketTransport';
import { RESOURCES_URL } from '../../api/constants';
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
  private filteredChats: ChatData[] = [];
  private activeChatId: number | null = null;
  private ws: WebSocketTransport | null = null;
  private currentUser: UserData | null = null;
  private messages: WSMessage[] = [];
  private searchQuery: string = '';

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

    const avatarHtml = chat.avatar
      ? `<img src="${RESOURCES_URL}${chat.avatar}" alt="${chat.title}">`
      : '<span class="avatar-placeholder"></span>';

    return `
      <a href="#" class="left-bar__content__mini-chat ${activeClass}" data-chat-id="${chat.id}">
        <div class="left-bar__content__mini-chat__avatar">
          ${avatarHtml}
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
      const chatsToDisplay = this.searchQuery ? this.filteredChats : this.chats;
      if (chatsToDisplay.length === 0 && this.searchQuery) {
        listEl.innerHTML = '<div class="no-results">Чаты не найдены</div>';
      } else {
        listEl.innerHTML = chatsToDisplay.map((c) => this.renderChatItem(c)).join('');
        this._bindChatClicks();
      }
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
    const avatarEl = this.element?.querySelector('.chat__chat-avatar');
    if (avatarEl) {
      avatarEl.innerHTML = chat?.avatar
        ? `<img src="${RESOURCES_URL}${chat.avatar}" alt="${chat.title}">`
        : '';
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
      try {
        const members = await ChatAPI.getChatUsers(this.activeChatId);
        const others = members.filter((u) => u.id !== this.currentUser?.id);
        if (others.length === 0) {
          alert('В чате нет других участников');
          return;
        }
        const bodyHtml = others
          .map(
            (u) =>
              `<div class="chat__user-item" data-user-id="${u.id}">
                <span>${u.first_name} ${u.second_name}</span>
                <span class="chat__user-login">@${u.login}</span>
              </div>`,
          )
          .join('');
        this._showModal('Удалить участника', bodyHtml);
        this.element?.querySelectorAll('[data-user-id]').forEach((item) => {
          item.addEventListener('click', async () => {
            const userId = Number((item as HTMLElement).dataset.userId);
            try {
              await ChatAPI.removeUsers(this.activeChatId!, [userId]);
              this._hideModal();
            } catch (error) {
              console.error('Ошибка удаления пользователя:', error);
            }
          });
        });
      } catch (error) {
        console.error('Ошибка загрузки участников чата:', error);
      }
    });
  }

  private _showModal(title: string, bodyHtml: string): void {
    const overlay = this.element?.querySelector('[data-modal]') as HTMLElement;
    const titleEl = this.element?.querySelector('[data-modal-title]');
    const bodyEl = this.element?.querySelector('[data-modal-body]');
    if (overlay && titleEl && bodyEl) {
      titleEl.textContent = title;
      bodyEl.innerHTML = bodyHtml;
      overlay.style.display = 'flex';
    }
  }

  private _hideModal(): void {
    const overlay = this.element?.querySelector('[data-modal]') as HTMLElement;
    if (overlay) overlay.style.display = 'none';
  }

  private _bindChatAvatarUpload(): void {
    const avatarInput = this.element?.querySelector('[data-avatar-input]') as HTMLInputElement;
    const avatarEl = this.element?.querySelector('.chat__chat-avatar');
    avatarEl?.addEventListener('click', () => {
      if (this.activeChatId) avatarInput?.click();
    });
    avatarInput?.addEventListener('change', async () => {
      if (!avatarInput.files?.length || !this.activeChatId) return;
      const formData = new FormData();
      formData.append('chatId', String(this.activeChatId));
      formData.append('avatar', avatarInput.files[0]);
      try {
        const updated = await ChatAPI.updateChatAvatar(formData);
        const idx = this.chats.findIndex((c) => c.id === this.activeChatId);
        if (idx !== -1) this.chats[idx] = updated;
        this.filteredChats = [...this.chats];
        this._updateChatList();
        this._updateChatHeader();
      } catch (error) {
        console.error('Ошибка смены аватара чата:', error);
      } finally {
        avatarInput.value = '';
      }
    });
  }

  private _bindDeleteChat(): void {
    const deleteBtn = this.element?.querySelector('[data-delete-chat]');
    deleteBtn?.addEventListener('click', async () => {
      if (!this.activeChatId) {
        alert('Выберите чат для удаления');
        return;
      }
      if (confirm('Вы уверены, что хотите удалить этот чат?')) {
        try {
          await ChatAPI.deleteChat(this.activeChatId);
          if (this.ws) {
            this.ws.close();
            this.ws = null;
          }
          this.activeChatId = null;
          this.messages = [];
          this.chats = await ChatAPI.getChats();
          this.filteredChats = this.chats;
          this._updateChatList();

          const chatContent = this.element?.querySelector('.chat__container__chat-content') as HTMLElement;
          if (chatContent) {
            chatContent.style.display = 'none';
          }
          const placeholder = this.element?.querySelector('.chat__placeholder') as HTMLElement;
          if (placeholder) {
            placeholder.style.display = '';
          }
          alert('Чат успешно удалён');
        } catch (error) {
          console.error('Ошибка удаления чата:', error);
          alert('Ошибка при удалении чата');
        }
      }
    });
  }

  private _bindSearchInput(): void {
    const searchInput = this.element?.querySelector('.top-bar__search__input') as HTMLInputElement;
    searchInput?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this.searchQuery = target.value.toLowerCase().trim();

      if (this.searchQuery) {
        this.filteredChats = this.chats.filter((chat) =>
          chat.title.toLowerCase().includes(this.searchQuery)
        );
      } else {
        this.filteredChats = this.chats;
      }

      this._updateChatList();
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
    this._bindDeleteChat();
    this._bindSearchInput();
    this._bindChatAvatarUpload();

    const modalClose = this.element?.querySelector('[data-modal-close]');
    modalClose?.addEventListener('click', () => this._hideModal());
    this.element?.querySelector('[data-modal]')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this._hideModal();
    });

    try {
      this.currentUser = await AuthAPI.getUser();
      this.chats = await ChatAPI.getChats();
      this.filteredChats = this.chats;
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
            <div class="chat__chat-avatar" title="Изменить аватар чата"></div>
            <div class="chat__chat-name"></div>
          </div>
          <div class="chat__chat-actions">
            <button class="chat__chat-action-btn" data-add-user type="button" title="Добавить пользователя">+👤</button>
            <button class="chat__chat-action-btn" data-remove-user type="button" title="Удалить пользователя">-👤</button>
            <button class="chat__chat-action-btn" data-delete-chat type="button" title="Удалить чат">🗑️</button>
          </div>
        </header>

        <article class="chat__container__chat-content__mini-chat">
        </article>

        <footer class="chat__message-form-container"></footer>
      </section>

      <div class="chat__modal-overlay" data-modal>
        <div class="chat__modal">
          <div class="chat__modal-header">
            <span data-modal-title></span>
            <button class="chat__modal-close" data-modal-close type="button">✕</button>
          </div>
          <div class="chat__modal-body" data-modal-body></div>
        </div>
      </div>

      <input type="file" accept="image/*" data-avatar-input style="display:none;">
    `;
  }
}

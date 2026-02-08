import { Block } from '../../core/Block';
import { Avatar } from '../../components/Avatar';
import { profileData } from './profileMockData';
import '../../assets/scss/collect.scss';
import './index.scss';

/**
 * Страница профиля пользователя - отображает информацию о пользователе
 */
export class ProfilePage extends Block {
  private avatar: Avatar;

  constructor() {
    super('section');

    this.avatar = new Avatar({
      src: profileData.avatar,
      alt: `Аватар пользователя ${profileData.displayName}`,
      size: 'large',
      editable: true,
      onChange: (file) => {
        console.log('Выбран файл для аватара:', file.name);
      },
    });
  }

  protected init(): void {
    if (this.element) {
      this.element.className = 'profile';
    }
  }

  private renderProfileField(label: string, value: string): string {
    return `
      <div class="profile__row">
        <div class="profile__row-label">${label}</div>
        <div class="profile__row-value">${value}</div>
      </div>
    `;
  }

  protected componentDidMount(): void {
    // Монтируем аватар
    const avatarContainer = this.element?.querySelector('.profile__avatar-container');
    if (avatarContainer && this.avatar.getContent()) {
      avatarContainer.appendChild(this.avatar.getContent()!);
      this.avatar.dispatchComponentDidMount();
    }

    // Добавляем обработчик для кнопки "Назад"
    const backButton = this.element?.querySelector('.profile__back-button');
    if (backButton) {
      backButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('navigate', { detail: '/chat' }));
      });
    }

    // Добавляем обработчики для ссылок
    const editLink = this.element?.querySelector('[data-edit-link]');
    if (editLink) {
      editLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('navigate', { detail: '/profile/edit' }));
      });
    }

    const passwordLink = this.element?.querySelector('[data-password-link]');
    if (passwordLink) {
      passwordLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('navigate', { detail: '/profile/password' }));
      });
    }

    // Добавляем обработчик для кнопки "Выйти"
    const logoutButton = this.element?.querySelector('.profile__logout');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        console.log('Выход из системы');
        window.dispatchEvent(new CustomEvent('navigate', { detail: '/auth' }));
      });
    }
  }

  render(): string {
    const fieldsHtml = profileData.fields.map((f) => this.renderProfileField(f.label, f.value)).join('');

    return `
      <aside class="profile__sidebar">
        <a href="/chat" class="profile__back-button">←</a>
      </aside>

      <main class="profile__content">
        <header class="profile__avatar-block">
          <div class="profile__avatar-container"></div>
          <div class="profile__name">${profileData.displayName}</div>
        </header>

        <section class="profile__info">
          ${fieldsHtml}
        </section>

        <footer class="profile__actions">
          <a href="/profile/edit" class="profile__action-link" data-edit-link>Изменить данные</a>
          <a href="/profile/password" class="profile__action-link" data-password-link>Изменить пароль</a>
          <button class="profile__logout" type="button">Выйти</button>
        </footer>
      </main>
    `;
  }
}

import { Block } from '../../core/Block';
import { Avatar } from '../../components/Avatar';
import { AuthAPI, UserData } from '../../api/AuthAPI';
import { UserAPI } from '../../api/UserAPI';
import '../../assets/scss/collect.scss';
import './index.scss';

const AVATAR_BASE_URL = 'https://ya-praktikum.tech/api/v2/resources';

export class ProfilePage extends Block {
  private avatar: Avatar;
  private userData: UserData | null = null;

  constructor() {
    super('section');

    this.avatar = new Avatar({
      src: null,
      alt: 'Аватар пользователя',
      size: 'large',
      editable: true,
      onChange: (file: File) => {
        this._handleAvatarChange(file);
      },
    });
  }

  private async _handleAvatarChange(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const user = await UserAPI.updateAvatar(formData);
      this.userData = user;
      if (user.avatar) {
        this.avatar.setProps({ src: `${AVATAR_BASE_URL}${user.avatar}` });
      }
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
    }
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

  private _updateContent(user: UserData): void {
    const nameEl = this.element?.querySelector('.profile__name');
    if (nameEl) {
      nameEl.textContent = user.display_name || user.first_name;
    }

    const infoEl = this.element?.querySelector('.profile__info');
    if (infoEl) {
      infoEl.innerHTML = [
        this.renderProfileField('Почта', user.email),
        this.renderProfileField('Логин', user.login),
        this.renderProfileField('Имя', user.first_name),
        this.renderProfileField('Фамилия', user.second_name),
        this.renderProfileField('Имя в чате', user.display_name || ''),
        this.renderProfileField('Телефон', user.phone),
      ].join('');
    }

    if (user.avatar) {
      this.avatar.setProps({ src: `${AVATAR_BASE_URL}${user.avatar}` });
    }
  }

  protected async componentDidMount(): Promise<void> {
    const avatarContainer = this.element?.querySelector('.profile__avatar-container');
    if (avatarContainer && this.avatar.getContent()) {
      avatarContainer.appendChild(this.avatar.getContent()!);
      this.avatar.dispatchComponentDidMount();
    }

    const backButton = this.element?.querySelector('.profile__back-button');
    if (backButton) {
      backButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('navigate', { detail: '/chat' }));
      });
    }

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

    const logoutButton = this.element?.querySelector('.profile__logout');
    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        try {
          await AuthAPI.logout();
        } catch {
          // ignore
        }
        window.dispatchEvent(new CustomEvent('navigate', { detail: '/auth' }));
      });
    }

    try {
      this.userData = await AuthAPI.getUser();
      this._updateContent(this.userData);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  }

  render(): string {
    return `
      <aside class="profile__sidebar">
        <a href="/chat" class="profile__back-button">←</a>
      </aside>

      <main class="profile__content">
        <header class="profile__avatar-block">
          <div class="profile__avatar-container"></div>
          <div class="profile__name">Загрузка...</div>
        </header>

        <section class="profile__info">
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

import { Block } from '../../core/Block';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Form } from '../../components/Form';
import { Avatar } from '../../components/Avatar';
import { AuthAPI } from '../../api/AuthAPI';
import { UserAPI, PasswordData } from '../../api/UserAPI';
import { RESOURCES_URL } from '../../api/constants';
import '../../assets/scss/collect.scss';
import './index.scss';

export class ProfilePasswordPage extends Block {
  private avatar: Avatar;
  private form: Form;

  constructor() {
    super('section');

    this.avatar = new Avatar({
      src: null,
      alt: 'Аватар',
      size: 'large',
      editable: false,
    });

    const oldPasswordInput = new Input({
      name: 'oldPassword',
      type: 'password',
      label: 'Старый пароль',
      validationType: 'oldPassword',
      wrapperClassName: 'profile__row--input',
    });

    const newPasswordInput = new Input({
      name: 'newPassword',
      type: 'password',
      label: 'Новый пароль',
      validationType: 'newPassword',
      wrapperClassName: 'profile__row--input',
    });

    const submitButton = new Button({
      text: 'Сохранить',
      type: 'submit',
      className: 'profile__primary-button',
    });

    this.form = new Form({
      inputs: {
        oldPassword: oldPasswordInput,
        newPassword: newPasswordInput,
      },
      button: submitButton,
      className: 'profile__info profile__form',
      onSubmit: (data) => {
        this._handleSubmit(data as unknown as PasswordData);
      },
    });
  }

  private async _handleSubmit(data: PasswordData) {
    try {
      await UserAPI.updatePassword(data);
      window.dispatchEvent(new CustomEvent('navigate', { detail: '/profile' }));
    } catch (error) {
      console.error('Ошибка смены пароля:', error);
    }
  }

  protected init(): void {
    if (this.element) {
      this.element.className = 'profile';
    }
  }

  protected async componentDidMount(): Promise<void> {
    const avatarContainer = this.element?.querySelector('.profile__avatar-container');
    if (avatarContainer && this.avatar.getContent()) {
      avatarContainer.appendChild(this.avatar.getContent()!);
      this.avatar.dispatchComponentDidMount();
    }

    const formContainer = this.element?.querySelector('.profile__form-container');
    if (formContainer && this.form.getContent()) {
      formContainer.appendChild(this.form.getContent()!);
      this.form.dispatchComponentDidMount();
    }

    const backButton = this.element?.querySelector('.profile__back-button');
    if (backButton) {
      backButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('navigate', { detail: '/profile' }));
      });
    }

    try {
      const user = await AuthAPI.getUser();
      const nameEl = this.element?.querySelector('.profile__name');
      if (nameEl) {
        nameEl.textContent = user.display_name || user.first_name;
      }
      if (user.avatar) {
        this.avatar.setProps({ src: `${RESOURCES_URL}${user.avatar}` });
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  }

  render(): string {
    return `
      <aside class="profile__sidebar">
        <a href="/profile" class="profile__back-button">←</a>
      </aside>

      <main class="profile__content">
        <header class="profile__avatar-block">
          <div class="profile__avatar-container"></div>
          <div class="profile__name">Загрузка...</div>
        </header>

        <section class="profile__form-container"></section>
      </main>
    `;
  }
}

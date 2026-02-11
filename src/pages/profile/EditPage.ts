import { Block } from '../../core/Block';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Form } from '../../components/Form';
import { Avatar } from '../../components/Avatar';
import { AuthAPI, UserData } from '../../api/AuthAPI';
import { UserAPI, ProfileData } from '../../api/UserAPI';
import '../../assets/scss/collect.scss';
import './index.scss';

const AVATAR_BASE_URL = 'https://ya-praktikum.tech/api/v2/resources';

export class ProfileEditPage extends Block {
  private avatar: Avatar;
  private form: Form;
  private inputs: Record<string, Input>;

  constructor() {
    super('section');

    this.avatar = new Avatar({
      src: null,
      alt: 'Аватар',
      size: 'large',
      editable: true,
      onChange: (file: File) => {
        this._handleAvatarChange(file);
      },
    });

    const emailInput = new Input({
      name: 'email',
      type: 'email',
      label: 'Почта',
      value: '',
      validationType: 'email',
      wrapperClassName: 'profile__row--input',
    });

    const loginInput = new Input({
      name: 'login',
      type: 'text',
      label: 'Логин',
      value: '',
      validationType: 'login',
      wrapperClassName: 'profile__row--input',
    });

    const firstNameInput = new Input({
      name: 'first_name',
      type: 'text',
      label: 'Имя',
      value: '',
      validationType: 'first_name',
      wrapperClassName: 'profile__row--input',
    });

    const secondNameInput = new Input({
      name: 'second_name',
      type: 'text',
      label: 'Фамилия',
      value: '',
      validationType: 'second_name',
      wrapperClassName: 'profile__row--input',
    });

    const displayNameInput = new Input({
      name: 'display_name',
      type: 'text',
      label: 'Имя в чате',
      value: '',
      validationType: 'display_name',
      wrapperClassName: 'profile__row--input',
    });

    const phoneInput = new Input({
      name: 'phone',
      type: 'tel',
      label: 'Телефон',
      value: '',
      validationType: 'phone',
      wrapperClassName: 'profile__row--input',
    });

    this.inputs = {
      email: emailInput,
      login: loginInput,
      first_name: firstNameInput,
      second_name: secondNameInput,
      display_name: displayNameInput,
      phone: phoneInput,
    };

    const submitButton = new Button({
      text: 'Сохранить',
      type: 'submit',
      className: 'profile__primary-button',
    });

    this.form = new Form({
      inputs: this.inputs,
      button: submitButton,
      className: 'profile__info profile__form',
      onSubmit: (data) => {
        this._handleSubmit(data as unknown as ProfileData);
      },
    });
  }

  private async _handleAvatarChange(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const user = await UserAPI.updateAvatar(formData);
      if (user.avatar) {
        this.avatar.setProps({ src: `${AVATAR_BASE_URL}${user.avatar}` });
      }
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
    }
  }

  private async _handleSubmit(data: ProfileData) {
    try {
      await UserAPI.updateProfile(data);
      window.dispatchEvent(new CustomEvent('navigate', { detail: '/profile' }));
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
    }
  }

  private _fillForm(user: UserData): void {
    this.inputs.email.setValue(user.email);
    this.inputs.login.setValue(user.login);
    this.inputs.first_name.setValue(user.first_name);
    this.inputs.second_name.setValue(user.second_name);
    this.inputs.display_name.setValue(user.display_name || '');
    this.inputs.phone.setValue(user.phone);

    if (user.avatar) {
      this.avatar.setProps({ src: `${AVATAR_BASE_URL}${user.avatar}` });
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
      this._fillForm(user);
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
        <section class="profile__avatar-block">
          <div class="profile__avatar-container"></div>
        </section>

        <section class="profile__form-container"></section>
      </main>
    `;
  }
}

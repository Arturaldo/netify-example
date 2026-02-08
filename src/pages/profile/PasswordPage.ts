import { Block } from '../../core/Block';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Form } from '../../components/Form';
import { Avatar } from '../../components/Avatar';
import { profileData } from './profileMockData';
import '../../assets/scss/collect.scss';
import './index.scss';

/**
 * Страница смены пароля
 */
export class ProfilePasswordPage extends Block {
  private avatar: Avatar;
  private form: Form;

  constructor() {
    super('section');

    this.avatar = new Avatar({
      src: profileData.avatar,
      alt: `Аватар ${profileData.display_name}`,
      size: 'large',
      editable: true,
      onChange: (file) => {
        console.log('Выбран файл для аватара:', file.name);
      },
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
        console.log('Данные формы смены пароля:', data);
      },
    });
  }

  protected init(): void {
    if (this.element) {
      this.element.className = 'profile';
    }
  }

  protected componentDidMount(): void {
    // Монтируем аватар
    const avatarContainer = this.element?.querySelector('.profile__avatar-container');
    if (avatarContainer && this.avatar.getContent()) {
      avatarContainer.appendChild(this.avatar.getContent()!);
      this.avatar.dispatchComponentDidMount();
    }

    // Монтируем форму
    const formContainer = this.element?.querySelector('.profile__form-container');
    if (formContainer && this.form.getContent()) {
      formContainer.appendChild(this.form.getContent()!);
      this.form.dispatchComponentDidMount();
    }

    // Добавляем обработчик для кнопки "Назад"
    const backButton = this.element?.querySelector('.profile__back-button');
    if (backButton) {
      backButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('navigate', { detail: '/profile' }));
      });
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
          <div class="profile__name">${profileData.display_name}</div>
        </header>

        <section class="profile__form-container"></section>
      </main>
    `;
  }
}

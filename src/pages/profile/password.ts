import { render } from '../../core/Block';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Form } from '../../components/Form';
import { Avatar } from '../../components/Avatar';
import { profileData } from './profileMockData';
import '../../assets/scss/collect.scss';
import './index.scss';

const avatar = new Avatar({
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
  className: 'profile__row profile__row--input',
});

const newPasswordInput = new Input({
  name: 'newPassword',
  type: 'password',
  label: 'Новый пароль',
  validationType: 'newPassword',
  className: 'profile__row profile__row--input',
});

const submitButton = new Button({
  text: 'Сохранить',
  type: 'submit',
  className: 'profile__primary-button',
});

const form = new Form({
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

document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('.app');
  if (!app) return;

  app.innerHTML = `
    <div class="profile">
      <aside class="profile__sidebar">
        <a href="./index.html" class="profile__back-button">←</a>
      </aside>

      <main class="profile__content">
        <div class="profile__avatar-block">
          <div class="profile__avatar-container"></div>
          <div class="profile__name">${profileData.display_name}</div>
        </div>

        <div class="profile__form-container"></div>
      </main>
    </div>
  `;

  render('.profile__avatar-container', avatar);
  render('.profile__form-container', form);
  form.dispatchComponentDidMount();
});

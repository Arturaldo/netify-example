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
  alt: 'Аватар',
  size: 'large',
  editable: true,
  onChange: (file) => {
    console.log('Выбран файл для аватара:', file.name);
  },
});

const emailInput = new Input({
  name: 'email',
  type: 'email',
  label: 'Почта',
  value: profileData.email,
  validationType: 'email',
  wrapperClassName: 'profile__row--input',
});

const loginInput = new Input({
  name: 'login',
  type: 'text',
  label: 'Логин',
  value: profileData.login,
  validationType: 'login',
  wrapperClassName: 'profile__row--input',
});

const firstNameInput = new Input({
  name: 'first_name',
  type: 'text',
  label: 'Имя',
  value: profileData.first_name,
  validationType: 'first_name',
  wrapperClassName: 'profile__row--input',
});

const secondNameInput = new Input({
  name: 'second_name',
  type: 'text',
  label: 'Фамилия',
  value: profileData.second_name,
  validationType: 'second_name',
  wrapperClassName: 'profile__row--input',
});

const displayNameInput = new Input({
  name: 'display_name',
  type: 'text',
  label: 'Имя в чате',
  value: profileData.display_name,
  validationType: 'display_name',
  wrapperClassName: 'profile__row--input',
});

const phoneInput = new Input({
  name: 'phone',
  type: 'tel',
  label: 'Телефон',
  value: profileData.phone,
  validationType: 'phone',
  wrapperClassName: 'profile__row--input',
});

const submitButton = new Button({
  text: 'Сохранить',
  type: 'submit',
  className: 'profile__primary-button',
});

const form = new Form({
  inputs: {
    email: emailInput,
    login: loginInput,
    first_name: firstNameInput,
    second_name: secondNameInput,
    display_name: displayNameInput,
    phone: phoneInput,
  },
  button: submitButton,
  className: 'profile__info profile__form',
  onSubmit: (data) => {
    console.log('Данные формы редактирования профиля:', data);
  },
});

document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('.app');
  if (!app) return;

  app.innerHTML = `
    <section class="profile">
      <aside class="profile__sidebar">
        <a href="./index.html" class="profile__back-button">←</a>
      </aside>

      <main class="profile__content">
        <section class="profile__avatar-block">
          <div class="profile__avatar-container"></div>
        </section>

        <section class="profile__form-container"></section>
      </main>
    </section>
  `;

  render('.profile__avatar-container', avatar);
  render('.profile__form-container', form);
  form.dispatchComponentDidMount();
});

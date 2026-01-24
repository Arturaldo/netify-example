import { render } from '../../core/Block';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Form } from '../../components/Form';
import { Link } from '../../components/Link';
import '../../assets/scss/collect.scss';
import './index.scss';

const loginInput = new Input({
  name: 'login',
  type: 'text',
  placeholder: 'Логин',
  validationType: 'login',
  className: 'auth__container__form__input',
});

const passwordInput = new Input({
  name: 'password',
  type: 'password',
  placeholder: 'Пароль',
  validationType: 'password',
  className: 'auth__container__form__input',
});

const submitButton = new Button({
  text: 'Войти',
  type: 'submit',
  className: 'auth__container__submit',
});

const form = new Form({
  inputs: {
    login: loginInput,
    password: passwordInput,
  },
  button: submitButton,
  className: 'auth__container__form',
  onSubmit: (data) => {
    console.log('Данные формы авторизации:', data);
  },
});

const registerLink = new Link({
  text: 'Нет аккаунта?',
  href: '/src/pages/register/index.html',
});

document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('.app');

  if (app) {
    const container = document.createElement('main');
    container.className = 'auth__container';

    const title = document.createElement('h1');
    title.textContent = 'Вход';
    container.appendChild(title);

    app.appendChild(container);

    render('.auth__container', form);

    if (registerLink.getContent()) {
      container.appendChild(registerLink.getContent()!);
    }

    form.dispatchComponentDidMount();
    registerLink.dispatchComponentDidMount();
  }
});

import { render } from '../../core/Block';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Form } from '../../components/Form';
import { Link } from '../../components/Link';
import '../../assets/scss/collect.scss';
import './index.scss';

const firstNameInput = new Input({
  name: 'first_name',
  type: 'text',
  placeholder: 'Имя',
  validationType: 'first_name',
  className: 'register__container__form__input',
});

const secondNameInput = new Input({
  name: 'second_name',
  type: 'text',
  placeholder: 'Фамилия',
  validationType: 'second_name',
  className: 'register__container__form__input',
});

const loginInput = new Input({
  name: 'login',
  type: 'text',
  placeholder: 'Логин',
  validationType: 'login',
  className: 'register__container__form__input',
});

const emailInput = new Input({
  name: 'email',
  type: 'email',
  placeholder: 'Email',
  validationType: 'email',
  className: 'register__container__form__input',
});

const passwordInput = new Input({
  name: 'password',
  type: 'password',
  placeholder: 'Пароль',
  validationType: 'password',
  className: 'register__container__form__input',
});

const phoneInput = new Input({
  name: 'phone',
  type: 'tel',
  placeholder: 'Телефон',
  validationType: 'phone',
  className: 'register__container__form__input',
});

const submitButton = new Button({
  text: 'Зарегистрироваться',
  type: 'submit',
  className: 'register__container__submit',
});

const form = new Form({
  inputs: {
    first_name: firstNameInput,
    second_name: secondNameInput,
    login: loginInput,
    email: emailInput,
    password: passwordInput,
    phone: phoneInput,
  },
  button: submitButton,
  className: 'register__container__form',
  onSubmit: (data) => {
    console.log('Данные формы регистрации:', data);
  },
});

const loginLink = new Link({
  text: 'Уже есть аккаунт?',
  href: '/src/pages/auth/index.html',
});

document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('.app');

  if (app) {
    const container = document.createElement('main');
    container.className = 'register__container';

    const title = document.createElement('h1');
    title.textContent = 'Регистрация';
    container.appendChild(title);

    app.appendChild(container);

    render('.register__container', form);

    if (loginLink.getContent()) {
      container.appendChild(loginLink.getContent()!);
    }

    form.dispatchComponentDidMount();
    loginLink.dispatchComponentDidMount();
  }
});

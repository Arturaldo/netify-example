import { Block } from '../../core/Block';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Form } from '../../components/Form';
import { Link } from '../../components/Link';
import '../../assets/scss/collect.scss';
import './index.scss';

/**
 * Страница авторизации (вход в систему)
 */
export class AuthPage extends Block {
  private form: Form;
  private registerLink: Link;

  constructor() {
    super('main');

    // Создаем инпуты
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

    // Создаем форму
    this.form = new Form({
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

    // Создаем ссылку на регистрацию
    this.registerLink = new Link({
      text: 'Нет аккаунта?',
      href: '/register',
      events: {
        click: (e: Event) => {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('navigate', { detail: '/register' }));
        },
      },
    });
  }

  protected init(): void {
    if (this.element) {
      this.element.className = 'auth__container';
    }
  }

  protected componentDidMount(): void {
    // Монтируем форму
    const formPlaceholder = this.element?.querySelector('[data-form]');
    if (formPlaceholder) {
      const formContent = this.form.getContent();
      if (formContent) {
        formPlaceholder.replaceWith(formContent);
        this.form.dispatchComponentDidMount();
      }
    }

    // Монтируем ссылку
    const linkPlaceholder = this.element?.querySelector('[data-register-link]');
    if (linkPlaceholder) {
      const linkContent = this.registerLink.getContent();
      if (linkContent) {
        linkPlaceholder.replaceWith(linkContent);
        this.registerLink.dispatchComponentDidMount();
      }
    }
  }

  render(): string {
    return `
      <h1>Вход</h1>
      <div data-form></div>
      <div data-register-link></div>
    `;
  }
}

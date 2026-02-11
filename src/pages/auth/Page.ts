import { Block } from '../../core/Block';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Form } from '../../components/Form';
import { Link } from '../../components/Link';
import { AuthAPI } from '../../api/AuthAPI';
import '../../assets/scss/collect.scss';
import './index.scss';

export class AuthPage extends Block {
  private form: Form;
  private registerLink: Link;

  constructor() {
    super('main');

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

    this.form = new Form({
      inputs: {
        login: loginInput,
        password: passwordInput,
      },
      button: submitButton,
      className: 'auth__container__form',
      onSubmit: (data) => {
        this._handleSignin(data as { login: string; password: string });
      },
    });

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

  private async _handleSignin(data: { login: string; password: string }) {
    try {
      await AuthAPI.signin(data);
      window.dispatchEvent(new CustomEvent('navigate', { detail: '/chat' }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Ошибка авторизации';
      this._showError(msg);
    }
  }

  private _showError(message: string) {
    const errorEl = this.element?.querySelector('.auth__error');
    if (errorEl) {
      errorEl.textContent = message;
      (errorEl as HTMLElement).style.display = 'block';
    }
  }

  protected init(): void {
    if (this.element) {
      this.element.className = 'auth__container';
    }
  }

  protected componentDidMount(): void {
    const formPlaceholder = this.element?.querySelector('[data-form]');
    if (formPlaceholder) {
      const formContent = this.form.getContent();
      if (formContent) {
        formPlaceholder.replaceWith(formContent);
        this.form.dispatchComponentDidMount();
      }
    }

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
      <div class="auth__error" style="display:none; color:red; margin-bottom:10px;"></div>
      <div data-form></div>
      <div data-register-link></div>
    `;
  }
}

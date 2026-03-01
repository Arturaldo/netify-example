import { Block } from '../../core/Block';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Form } from '../../components/Form';
import { Link } from '../../components/Link';
import { AuthAPI, SignupData } from '../../api/AuthAPI';
import '../../assets/scss/collect.scss';
import './index.scss';

export class RegisterPage extends Block {
  private form: Form;
  private loginLink: Link;

  constructor() {
    super('main');

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

    this.form = new Form({
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
        this._handleSignup(data as unknown as SignupData);
      },
    });

    this.loginLink = new Link({
      text: 'Уже есть аккаунт?',
      href: '/auth',
      events: {
        click: (e: Event) => {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('navigate', { detail: '/auth' }));
        },
      },
    });
  }

  private async _handleSignup(data: SignupData) {
    try {
      await AuthAPI.signup(data);
      window.dispatchEvent(new CustomEvent('navigate', { detail: '/chat' }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Ошибка регистрации';
      this._showError(msg);
    }
  }

  private _showError(message: string) {
    const errorEl = this.element?.querySelector('.register__error');
    if (errorEl) {
      errorEl.textContent = message;
      (errorEl as HTMLElement).style.display = 'block';
    }
  }

  protected init(): void {
    if (this.element) {
      this.element.className = 'register__container';
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

    const linkPlaceholder = this.element?.querySelector('[data-login-link]');
    if (linkPlaceholder) {
      const linkContent = this.loginLink.getContent();
      if (linkContent) {
        linkPlaceholder.replaceWith(linkContent);
        this.loginLink.dispatchComponentDidMount();
      }
    }
  }

  render(): string {
    return `
      <h1>Регистрация</h1>
      <div class="register__error" style="display:none; color:red; margin-bottom:10px;"></div>
      <div data-form></div>
      <div data-login-link></div>
    `;
  }
}

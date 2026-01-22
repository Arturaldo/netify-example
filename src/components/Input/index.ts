import { Block, BlockProps } from '../../core/Block';
import { validate, ValidationField } from '../../utils/validation';

interface InputProps extends BlockProps {
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  validationType?: ValidationField;
  className?: string;
  label?: string;
  error?: string;
  onBlur?: (e: FocusEvent) => void;
  onFocus?: (e: FocusEvent) => void;
}

export class Input extends Block<InputProps> {
  constructor(props: InputProps) {
    super('div', {
      ...props,
      events: {
        focusout: (e: Event) => this._handleBlur(e as FocusEvent),
        focusin: (e: Event) => this._handleFocus(e as FocusEvent),
        input: (e: Event) => this._handleInput(e),
      },
    });
  }

  private _handleInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    if (target.tagName !== 'INPUT') return;

    // НИЧЕГО не пишем в this.props, иначе ловим перерендер
    // значение берём из DOM в getValue()
  }

  private _handleBlur(e: FocusEvent): void {
    const target = e.target as HTMLInputElement;
    if (target.tagName !== 'INPUT') return;

    const value = target.value;

    if (this.props.validationType) {
      const result = validate(this.props.validationType, value);
      if (result.error) {
        this._showError(result.error);
      }
    }

    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  }

  private _handleFocus(e: FocusEvent): void {
    const target = e.target as HTMLInputElement;
    if (target.tagName !== 'INPUT') return;

    this._hideError();

    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  }

  private _showError(error: string): void {
    const errorEl = this.element?.querySelector('.input__error') as HTMLElement;
    const inputEl = this.element?.querySelector('.input') as HTMLInputElement;

    if (errorEl) {
      errorEl.textContent = error;
      errorEl.style.display = 'block';
    }

    if (inputEl) {
      inputEl.classList.add('input--error');
    }

    // НЕ трогаем this.props.error, иначе Proxy спровоцирует перерендер
  }

  private _hideError(): void {
    const errorEl = this.element?.querySelector('.input__error') as HTMLElement;
    const inputEl = this.element?.querySelector('.input') as HTMLInputElement;

    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }

    if (inputEl) {
      inputEl.classList.remove('input--error');
    }

    // Тут тоже не трогаем this.props.error
  }

  public getValue(): string {
    const input = this.element?.querySelector('input') as HTMLInputElement;
    return input?.value || '';
  }

  public setValue(value: string): void {
    const input = this.element?.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = value;
      // опять же, this.props.value лучше не трогать во время жизни компонента
    }
  }

  public validate(): boolean {
    if (!this.props.validationType) {
      return true;
    }

    const value = this.getValue();
    const result = validate(this.props.validationType, value);

    if (result.error) {
      this._showError(result.error);
    } else {
      this._hideError();
    }

    return result.isValid;
  }

  public getName(): string {
    return this.props.name;
  }

  render(): string {
    const {
      name,
      type = 'text',
      placeholder = '',
      value = '',
      className = '',
      label = '',
      error = '',
    } = this.props;

    const labelHtml = label
      ? `<label class="input__label" for="${name}">${label}</label>`
      : '';

    return `
      <div class="input-wrapper">
        ${labelHtml}
        <input
          class="input ${className} ${error ? 'input--error' : ''}"
          type="${type}"
          name="${name}"
          id="${name}"
          placeholder="${placeholder}"
          value="${value}"
        />
        <span class="input__error" style="display: ${error ? 'block' : 'none'}">${error}</span>
      </div>
    `;
  }
}

import { Block, BlockProps, BlockEvent } from '../../core/Block';
import { validate, ValidationField } from '../../utils/validation';

interface InputProps extends BlockProps {
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  validationType?: ValidationField;
  className?: string;
  wrapperClassName?: string;
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
        focusout: (e: BlockEvent) => this._handleBlur(e as FocusEvent),
        focusin: (e: BlockEvent) => this._handleFocus(e as FocusEvent),
        input: (e: BlockEvent) => this._handleInput(e),
      },
    });
  }

  private _handleInput(e: BlockEvent): void {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
  }

  private _handleBlur(e: BlockEvent): void {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;

    const value = target.value;

    if (this.props.validationType) {
      const result = validate(this.props.validationType, value);
      if (result.error) {
        this._showError(result.error);
      }
    }

    if (this.props.onBlur && e instanceof FocusEvent) {
      this.props.onBlur(e);
    }
  }

  private _handleFocus(e: BlockEvent): void {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;

    this._hideError();

    if (this.props.onFocus && e instanceof FocusEvent) {
      this.props.onFocus(e);
    }
  }

  private _showError(error: string): void {
    const errorEl = this.element?.querySelector<HTMLElement>('.input__error');
    const inputEl = this.element?.querySelector<HTMLInputElement>('.input');

    if (errorEl) {
      errorEl.textContent = error;
      errorEl.style.display = 'block';
    }

    if (inputEl) {
      inputEl.classList.add('input--error');
    }
  }

  private _hideError(): void {
    const errorEl = this.element?.querySelector<HTMLElement>('.input__error');
    const inputEl = this.element?.querySelector<HTMLInputElement>('.input');

    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }

    if (inputEl) {
      inputEl.classList.remove('input--error');
    }
  }

  public getValue(): string {
    const input = this.element?.querySelector<HTMLInputElement>('input');
    return input?.value || '';
  }

  public setValue(value: string): void {
    const input = this.element?.querySelector<HTMLInputElement>('input');
    if (input) {
      input.value = value;
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
      wrapperClassName = '',
      label = '',
      error = '',
    } = this.props;

    const labelHtml = label
      ? `<label class="input__label" for="${name}">${label}</label>`
      : '';

    return `
      <div class="input-wrapper ${wrapperClassName}">
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

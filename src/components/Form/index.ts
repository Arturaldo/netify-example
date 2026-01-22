import { Block, BlockProps } from '../../core/Block';
import { Input } from '../Input';
import { Button } from '../Button';

interface FormProps extends BlockProps {
  inputs: Record<string, Input>;
  button: Button;
  className?: string;
  onSubmit?: (data: Record<string, string>) => void;
}

export class Form extends Block<FormProps> {
  constructor(props: FormProps) {
    const { button, ...rest } = props;

    super('form', {
      ...rest,
      events: {
        submit: (e: Event) => this._handleSubmit(e),
      },
    });

    (this.props as FormProps).button = button;
  }

  protected init(): void {
    if (this.element && this.props.className) {
      this.element.className = this.props.className;
    }
  }

  private _handleSubmit(e: Event): void {
    e.preventDefault();

    const isValid = this.validateAll();

    if (isValid) {
      const data = this.getFormData();
      console.log('Form data:', data);

      if (this.props.onSubmit) {
        this.props.onSubmit(data);
      }
    }
  }

  public getFormData(): Record<string, string> {
    const data: Record<string, string> = {};

    Object.values(this.props.inputs).forEach((input) => {
      data[input.getName()] = input.getValue();
    });

    return data;
  }

  public validateAll(): boolean {
    let isValid = true;

    Object.values(this.props.inputs).forEach((input) => {
      const inputValid = input.validate();
      if (!inputValid) {
        isValid = false;
      }
    });

    return isValid;
  }

  private _renderChildren(): string {
    const inputsHtml = Object.entries(this.props.inputs)
      .map(([key]) => `<div data-input="${key}"></div>`)
      .join('');

    return `
      <div class="form__inputs">
        ${inputsHtml}
      </div>
      <div class="form__button" data-button></div>
    `;
  }

  protected componentDidMount(): void {
    Object.entries(this.props.inputs).forEach(([key, input]) => {
      const placeholder = this.element?.querySelector(`[data-input="${key}"]`);
      if (placeholder && input.getContent()) {
        placeholder.replaceWith(input.getContent()!);
      }
    });

    const buttonPlaceholder = this.element?.querySelector('[data-button]');
    if (buttonPlaceholder && this.props.button.getContent()) {
      buttonPlaceholder.replaceWith(this.props.button.getContent()!);
    }
  }

  render(): string {
    return this._renderChildren();
  }
}

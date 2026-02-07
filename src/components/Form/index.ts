import { Block, BlockProps, BlockEvent } from '../../core/Block';
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
    super('form', {
      ...props,
      events: {
        submit: (e: BlockEvent) => this._handleSubmit(e),
      },
    });
  }

  protected init(): void {
    if (this.element && this.props.className) {
      this.element.className = this.props.className;
    }
  }

  private _handleSubmit(e: BlockEvent): void {
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
    const inputs = (this.children.inputs as unknown as Record<string, Input>) || this.props.inputs;

    Object.values(inputs).forEach((input) => {
      data[input.getName()] = input.getValue();
    });

    return data;
  }

  public validateAll(): boolean {
    let isValid = true;
    const inputs = (this.children.inputs as unknown as Record<string, Input>) || this.props.inputs;

    Object.values(inputs).forEach((input) => {
      const inputValid = input.validate();
      if (!inputValid) {
        isValid = false;
      }
    });

    return isValid;
  }

  private _renderChildren(): string {
    const inputs = (this.children.inputs as unknown as Record<string, Input>) || this.props.inputs;
    const inputsHtml = Object.entries(inputs)
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
    const inputs = (this.children.inputs as unknown as Record<string, Input>) || this.props.inputs;
    const button = (this.children.button as unknown as Button) || this.props.button;

    Object.entries(inputs).forEach(([key, input]) => {
      const placeholder = this.element?.querySelector(`[data-input="${key}"]`);
      if (placeholder && input.getContent()) {
        placeholder.replaceWith(input.getContent()!);
      }
    });

    const buttonPlaceholder = this.element?.querySelector('[data-button]');
    if (buttonPlaceholder && button && button.getContent()) {
      buttonPlaceholder.replaceWith(button.getContent()!);
    }

    // Добавляем dispatchComponentDidMount для вложенных компонентов
    Object.values(inputs).forEach((input) => {
      input.dispatchComponentDidMount();
    });

    if (button) {
      button.dispatchComponentDidMount();
    }
  }

  render(): string {
    return this._renderChildren();
  }
}

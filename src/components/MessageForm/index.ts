import { Block, BlockProps } from '../../core/Block';
import { Input } from '../Input';
import { Button } from '../Button';
import { validate } from '../../utils/validation';

interface MessageFormProps extends BlockProps {
  onSubmit?: (message: string) => void;
}

export class MessageForm extends Block<MessageFormProps> {
  constructor(props: MessageFormProps) {
    super('form', {
      ...props,
      messageInput: new Input({
        name: 'message',
        type: 'text',
        placeholder: 'Сообщение',
        validationType: 'message',
        className: 'chat__input-field-wrapper',
      }),
      sendButton: new Button({
        text: '➤',
        type: 'submit',
        className: 'chat__input-send',
      }),
      events: {
        submit: (e: Event) => this._handleSubmit(e),
      },
    });
  }

  protected init(): void {
    if (this.element) {
      this.element.className = 'chat__input';
      this.element.setAttribute('autocomplete', 'off');
    }
  }

  private _handleSubmit(e: Event): void {
    e.preventDefault();

    const input = this.children.messageInput as Input;
    const value = input.getValue();
    const result = validate('message', value);

    if (result.isValid) {
      if (this.props.onSubmit) {
        this.props.onSubmit(value);
      }
      input.setValue('');
    } else {
      input.validate();
    }
  }

  render(): DocumentFragment {
    return this.compile(`
      {{{ messageInput }}}
      {{{ sendButton }}}
    `);
  }
}

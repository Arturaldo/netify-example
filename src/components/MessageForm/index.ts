import { Block, BlockProps } from '../../core/Block';
import { Input } from '../Input';
import { Button } from '../Button';
import { validate } from '../../utils/validation';

interface MessageFormProps extends BlockProps {
  onSubmit?: (message: string) => void;
}

/**
 * Пример компонента с использованием Handlebars шаблонизации.
 *
 * Преимущества:
 * 1. Шаблон декларативен — видно структуру компонента
 * 2. Дочерние компоненты вставляются автоматически через {{{ name }}}
 * 3. Не нужен ручной код в componentDidMount для замены плейсхолдеров
 */
export class MessageForm extends Block<MessageFormProps> {
  constructor(props: MessageFormProps) {
    // Создаём дочерние компоненты и передаём их в super() через props
    super('form', {
      ...props,
      // Дочерние компоненты — Block автоматически выделит их в this.children
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
      console.log('Отправка сообщения:', { message: value });
      if (this.props.onSubmit) {
        this.props.onSubmit(value);
      }
      input.setValue('');
    } else {
      input.validate();
    }
  }

  /**
   * Используем compile() для рендеринга с Handlebars.
   * {{{ messageInput }}} и {{{ sendButton }}} — это дочерние компоненты,
   * которые автоматически заменятся на реальные DOM-элементы.
   */
  render(): DocumentFragment {
    return this.compile(`
      {{{ messageInput }}}
      {{{ sendButton }}}
    `);
  }
}

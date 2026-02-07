import { Block, BlockProps } from '../../core/Block';

interface ButtonProps extends BlockProps {
  text: string;
  type?: 'submit' | 'button' | 'reset';
  className?: string;
  onClick?: (e: MouseEvent) => void;
}

export class Button extends Block<ButtonProps> {
  constructor(props: ButtonProps) {
    super('button', {
      ...props,
      events: {
        click: (e: Event) => {
          if (props.onClick) {
            props.onClick(e as MouseEvent);
          }
        },
      },
    });
  }

  protected init(): void {
    if (this.element) {
      this.element.setAttribute('type', this.props.type || 'button');
      if (this.props.className) {
        this.element.className = this.props.className;
      }
    }
  }

  render(): string {
    return this.props.text;
  }
}

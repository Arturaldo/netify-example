import { Block, BlockProps } from '../../core/Block';

interface LinkProps extends BlockProps {
  text: string;
  href: string;
  className?: string;
}

export class Link extends Block<LinkProps> {
  constructor(props: LinkProps) {
    super('a', props);
  }

  protected init(): void {
    if (this.element) {
      this.element.setAttribute('href', this.props.href);
      if (this.props.className) {
        this.element.className = this.props.className;
      }
    }
  }

  render(): string {
    return this.props.text;
  }
}

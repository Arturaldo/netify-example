import { Block, BlockProps } from '../../core/Block';

export interface MessageProps extends BlockProps {
  text?: string;
  image?: string;
  imageAlt?: string;
  time: string;
  isOutgoing: boolean;
  status?: string;
}

export class Message extends Block<MessageProps> {
  constructor(props: MessageProps) {
    super('div', props);
  }

  protected init(): void {
    if (this.element) {
      this.element.className = `message ${this.props.isOutgoing ? 'message--outgoing' : 'message--incoming'}`;
    }
  }

  render(): DocumentFragment {
    const { text, image, imageAlt, time, isOutgoing, status } = this.props;

    return this.compile(
      `
      <div class="message__bubble {{#if image}}message__bubble--media{{/if}}">
        {{#if text}}{{ text }}{{/if}}
        {{#if image}}<img src="{{ image }}" alt="{{ imageAlt }}" class="message__image">{{/if}}
      </div>
      {{#if isOutgoing}}
        <div class="message__meta">
          {{#if status}}<span class="message__status">{{ status }}</span>{{/if}}
          <span class="message__time">{{ time }}</span>
        </div>
      {{else}}
        <div class="message__time">{{ time }}</div>
      {{/if}}
    `,
      { text, image, imageAlt, time, isOutgoing, status }
    );
  }
}

import { Block, BlockProps } from '../../core/Block';
import { ChatItem } from '../ChatItem';

interface ChatData {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
  unreadCount?: number;
  isActive?: boolean;
}

interface ChatListProps extends BlockProps {
  chats: ChatData[];
  onChatSelect?: (chatId: string) => void;
}

export class ChatList extends Block<ChatListProps> {
  constructor(props: ChatListProps) {
    const chatItems = props.chats.map(
      (chat) =>
        new ChatItem({
          ...chat,
          onClick: () => {
            if (props.onChatSelect) {
              props.onChatSelect(chat.id);
            }
          },
        })
    );

    super('div', {
      ...props,
      items: chatItems,
    });
  }

  protected init(): void {
    if (this.element) {
      this.element.className = 'chat__container__left-bar__content scrollable';
    }
  }

  render(): DocumentFragment {
    return this.compile(`{{{ items }}}`);
  }

  public updateChats(chats: ChatData[]): void {
    const chatItems = chats.map(
      (chat) =>
        new ChatItem({
          ...chat,
          onClick: () => {
            if (this.props.onChatSelect) {
              this.props.onChatSelect(chat.id);
            }
          },
        })
    );

    this.children.items = chatItems;
    this.setProps({ chats });
  }
}

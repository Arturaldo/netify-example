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

/**
 * Компонент списка чатов.
 * Демонстрирует работу с массивом дочерних компонентов.
 */
export class ChatList extends Block<ChatListProps> {
  constructor(props: ChatListProps) {
    // Создаём массив дочерних компонентов ChatItem
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
      // Массив компонентов также можно передать как children
      items: chatItems,
    });
  }

  protected init(): void {
    if (this.element) {
      this.element.className = 'chat__container__left-bar__content scrollable';
    }
  }

  /**
   * Массив компонентов {{{ items }}} автоматически развернётся
   * в последовательность DOM-элементов.
   */
  render(): DocumentFragment {
    return this.compile(`{{{ items }}}`);
  }

  /**
   * Метод для обновления списка чатов.
   * Создаёт новые дочерние компоненты и вызывает перерендер.
   */
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

    // Обновляем children и props
    this.children.items = chatItems;
    this.setProps({ chats });
  }
}

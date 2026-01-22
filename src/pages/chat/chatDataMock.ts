export interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  avatar: string | null;
  isActive?: boolean;
}

export interface Message {
  id: number;
  isOutgoing: boolean;
  text?: string;
  image?: string;
  imageAlt?: string;
  time: string;
  status?: string;
}

export interface CurrentChat {
  id: number;
  name: string;
  date: string;
}

export const chatsData: Chat[] = [
  {
    id: 1,
    name: 'Андрей',
    lastMessage: 'Изображение',
    time: '10:49',
    unreadCount: 2,
    avatar: null,
  },
  {
    id: 2,
    name: 'Киноклуб',
    lastMessage: 'Вы: стикер',
    time: '12:00',
    unreadCount: 0,
    avatar: null,
  },
  {
    id: 3,
    name: 'Илья',
    lastMessage: 'Друзья, у меня для вас особенный выпуск новостей!...',
    time: '15:12',
    unreadCount: 4,
    avatar: null,
  },
  {
    id: 4,
    name: 'Вадим',
    lastMessage: 'Вы: Круто!',
    time: 'Пт',
    unreadCount: 0,
    isActive: true,
    avatar: null,
  },
  {
    id: 5,
    name: 'Мария',
    lastMessage: 'Спасибо, всё получила.',
    time: 'Вчера',
    unreadCount: 1,
    avatar: null,
  },
  {
    id: 6,
    name: 'Рабочий чат',
    lastMessage: 'Созвонимся в 11:30.',
    time: '09:10',
    unreadCount: 3,
    avatar: null,
  },
  {
    id: 7,
    name: 'Мама',
    lastMessage: 'Когда приедешь?',
    time: '08:45',
    unreadCount: 0,
    avatar: null,
  },
  {
    id: 8,
    name: 'Папа',
    lastMessage: 'Посмотри новости, там про это говорят.',
    time: 'Вчера',
    unreadCount: 0,
    avatar: null,
  },
];

export const chatPageData = {
  currentChat: {
    id: 4,
    name: 'Вадим',
    date: '19 июня',
  } as CurrentChat,
  messages: [
    {
      id: 1,
      isOutgoing: false,
      text: 'Привет! Смотри, тут всплыл интересный кусок лунной космической истории — НАСА в какой-то момент попросила Хассельблад адаптировать модель SWC для полетов на Луну.',
      time: '11:56',
    },
    {
      id: 2,
      isOutgoing: false,
      image: '../../../static/img/Camera.svg',
      imageAlt: 'Камера',
      time: '11:56',
    },
    {
      id: 3,
      isOutgoing: true,
      text: 'Круто!',
      time: '12:00',
      status: '✓✓',
    },
  ] as Message[],
};

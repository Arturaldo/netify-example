import { HTTPTransport } from '../core/HTTPTransport';
import { BASE_URL } from './constants';

export interface ChatData {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  last_message: {
    user: {
      first_name: string;
      second_name: string;
      avatar: string | null;
      email: string;
      login: string;
      phone: string;
    };
    time: string;
    content: string;
  } | null;
}

export interface ChatUser {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string | null;
  login: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: string;
}

class ChatAPIClass {
  private http = new HTTPTransport(BASE_URL);

  getChats() {
    return this.http.get<ChatData[]>('/chats');
  }

  createChat(title: string) {
    return this.http.post<{ id: number }>('/chats', { data: { title } });
  }

  deleteChat(chatId: number) {
    return this.http.delete('/chats', { data: { chatId: chatId } });
  }

  addUsers(chatId: number, users: number[]) {
    return this.http.put('/chats/users', { data: { users, chatId } });
  }

  removeUsers(chatId: number, users: number[]) {
    return this.http.delete('/chats/users', { data: { users, chatId } });
  }

  getChatToken(chatId: number) {
    return this.http.post<{ token: string }>(`/chats/token/${chatId}`);
  }

  getChatUsers(chatId: number) {
    return this.http.get<ChatUser[]>(`/chats/${chatId}/users`);
  }

  getNewMessagesCount(chatId: number) {
    return this.http.get<{ unread_count: number }>(`/chats/new/${chatId}`);
  }

  updateChatAvatar(formData: FormData) {
    return this.http.put<ChatData>('/chats/avatar', { data: formData });
  }
}

export const ChatAPI = new ChatAPIClass();

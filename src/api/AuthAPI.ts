import { HTTPTransport } from '../core/HTTPTransport';

export interface SignupData {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
}

export interface SigninData {
  login: string;
  password: string;
}

export interface UserData {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string | null;
  login: string;
  email: string;
  phone: string;
  avatar: string | null;
}

const BASE_URL = 'https://ya-praktikum.tech/api/v2';

class AuthAPIClass {
  private http = new HTTPTransport(BASE_URL);

  signup(data: SignupData) {
    return this.http.post<{ id: number }>('/auth/signup', { data });
  }

  signin(data: SigninData) {
    return this.http.post('/auth/signin', { data });
  }

  logout() {
    return this.http.post('/auth/logout');
  }

  getUser() {
    return this.http.get<UserData>('/auth/user');
  }
}

export const AuthAPI = new AuthAPIClass();

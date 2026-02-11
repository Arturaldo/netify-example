import { HTTPTransport } from '../core/HTTPTransport';
import { UserData } from './AuthAPI';

export interface ProfileData {
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
}

export interface PasswordData {
  oldPassword: string;
  newPassword: string;
}

const BASE_URL = 'https://ya-praktikum.tech/api/v2';

class UserAPIClass {
  private http = new HTTPTransport(BASE_URL);

  updateProfile(data: ProfileData) {
    return this.http.put<UserData>('/user/profile', { data });
  }

  updatePassword(data: PasswordData) {
    return this.http.put('/user/password', { data });
  }

  updateAvatar(formData: FormData) {
    return this.http.put<UserData>('/user/profile/avatar', { data: formData });
  }

  searchUsers(login: string) {
    return this.http.post<UserData[]>('/user/search', { data: { login } });
  }
}

export const UserAPI = new UserAPIClass();

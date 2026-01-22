export interface ProfileField {
  label: string;
  value: string;
  name: string;
}

export interface ProfileData {
  avatar: string | null;
  displayName: string;
  email: string;
  login: string;
  first_name: string;
  second_name: string;
  display_name: string;
  phone: string;
  fields: ProfileField[];
}

export const profileData: ProfileData = {
  avatar: null,
  displayName: 'Иван',
  email: 'pochta@yandex.ru',
  login: 'ivanivanov',
  first_name: 'Иван',
  second_name: 'Иванов',
  display_name: 'Иван',
  phone: '+79099673030',
  fields: [
    { label: 'Почта', value: 'pochta@yandex.ru', name: 'email' },
    { label: 'Логин', value: 'ivanivanov', name: 'login' },
    { label: 'Имя', value: 'Иван', name: 'first_name' },
    { label: 'Фамилия', value: 'Иванов', name: 'second_name' },
    { label: 'Имя в чате', value: 'Иван', name: 'display_name' },
    { label: 'Телефон', value: '+79099673030', name: 'phone' },
  ],
};

export type ValidationField =
  | 'first_name'
  | 'second_name'
  | 'login'
  | 'email'
  | 'password'
  | 'phone'
  | 'message'
  | 'oldPassword'
  | 'newPassword'
  | 'display_name';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const VALIDATION_RULES: Record<string, RegExp> = {
  first_name: /^[A-ZА-ЯЁ][a-zа-яё-]*$/,
  second_name: /^[A-ZА-ЯЁ][a-zа-яё-]*$/,
  login: /^(?=.*[a-zA-Z])[a-zA-Z0-9_-]{3,20}$/,
  email: /^[a-zA-Z0-9._-]+@[a-zA-Z]+\.[a-zA-Z]+$/,
  password: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
  phone: /^\+?\d{10,15}$/,
  message: /^.+$/s,
  oldPassword: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
  newPassword: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
  display_name: /^[a-zA-Zа-яА-ЯёЁ0-9_-]{1,20}$/,
};

const ERROR_MESSAGES: Record<string, string> = {
  first_name: 'Первая буква должна быть заглавной, без пробелов, цифр и спецсимволов (допустим дефис)',
  second_name: 'Первая буква должна быть заглавной, без пробелов, цифр и спецсимволов (допустим дефис)',
  login: 'От 3 до 20 символов, латиница, может содержать цифры (но не состоять из них), дефис и подчёркивание',
  email: 'Неверный формат email',
  password: 'От 8 до 40 символов, обязательно хотя бы одна заглавная буква и цифра',
  phone: 'От 10 до 15 цифр, может начинаться с плюса',
  message: 'Сообщение не должно быть пустым',
  oldPassword: 'От 8 до 40 символов, обязательно хотя бы одна заглавная буква и цифра',
  newPassword: 'От 8 до 40 символов, обязательно хотя бы одна заглавная буква и цифра',
  display_name: 'От 1 до 20 символов, буквы, цифры, дефис и подчёркивание',
};

export function validate(field: ValidationField, value: string): ValidationResult {
  const rule = VALIDATION_RULES[field];

  if (!rule) {
    return { isValid: true };
  }

  const isValid = rule.test(value);

  return {
    isValid,
    error: isValid ? undefined : ERROR_MESSAGES[field],
  };
}

export function getErrorMessage(field: ValidationField): string {
  return ERROR_MESSAGES[field] || 'Неверное значение';
}

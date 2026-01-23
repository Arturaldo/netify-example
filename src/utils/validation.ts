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
  first_name: 'Заглавная буква, без пробелов и цифр',
  second_name: 'Заглавная буква, без пробелов и цифр',
  login: '3-20 символов, латиница, цифры, - и _',
  email: 'Неверный формат email',
  password: '8-40 символов, заглавная буква и цифра',
  phone: '10-15 цифр, может начинаться с +',
  message: 'Сообщение не должно быть пустым',
  oldPassword: '8-40 символов, заглавная буква и цифра',
  newPassword: '8-40 символов, заглавная буква и цифра',
  display_name: '1-20 символов, буквы, цифры, - и _',
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

# Messenger App

Веб-приложение мессенджера.

## Функциональность

- Авторизация и регистрация с валидацией
- Страница чатов с лентой переписки
- Профиль пользователя (просмотр, редактирование, смена пароля)
- Страницы ошибок 404 и 500.

## Технологии

- TypeScript
- Vite
- Handlebars
- SCSS
- ESLint + Stylelint

## Структура

```
src/
├── core/           # Block, EventBus, HTTPTransport
├── components/     # Переиспользуемые компоненты
├── pages/          # Страницы приложения
├── utils/          # Валидация
└── assets/         # Стили и шрифты
```

## Скрипты

```bash
npm install          # Установка зависимостей
npm run start        # Dev-сервер на http://localhost:3000
npm run build        # Сборка
npm run validate     # Проверка типов + линтинг
```

## Деплой

https://scintillating-strudel-fa2ed9.netlify.app

- [Вход](https://scintillating-strudel-fa2ed9.netlify.app/src/pages/auth/index.html)
- [Регистрация](https://scintillating-strudel-fa2ed9.netlify.app/src/pages/register/index.html)
- [Чат](https://scintillating-strudel-fa2ed9.netlify.app/src/pages/chat/index.html)
- [Профиль](https://scintillating-strudel-fa2ed9.netlify.app/src/pages/profile/index.html)

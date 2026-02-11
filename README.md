# Messenger App

Веб-приложение мессенджера с real-time обменом сообщениями.

## Функциональность

- Авторизация и регистрация с валидацией форм
- Проверка авторизации при навигации (неавторизованные пользователи перенаправляются на страницу входа)
- Страница чатов: создание чатов, добавление/удаление пользователей, отправка и получение сообщений в реальном времени через WebSocket
- Профиль пользователя: просмотр, редактирование данных, смена аватара, смена пароля
- Выход из системы
- Страницы ошибок 404 и 500

## Технологии

- **TypeScript** — типизация
- **Vite** — сборка проекта
- **Handlebars** — шаблонизация
- **SCSS** — стилизация
- **ESLint + Stylelint** — линтинг
- **WebSocket** — real-time сообщения
- **Yandex Praktikum API** — бэкенд (`https://ya-praktikum.tech/api/v2`)

## Архитектура

- Компонентный подход: базовый класс `Block` с lifecycle-методами и EventBus
- SPA-роутер (Singleton + Builder паттерны)
- HTTP-транспорт на основе XMLHttpRequest с поддержкой JSON и FormData
- WebSocket-транспорт для real-time сообщений с автоматическим пингом
- API-сервисы: `AuthAPI`, `UserAPI`, `ChatAPI`

## Структура

```
src/
├── api/            # API-сервисы (AuthAPI, UserAPI, ChatAPI)
├── core/           # Block, EventBus, Router, Route, HTTPTransport, WebSocketTransport
├── components/     # Переиспользуемые компоненты (Input, Button, Form, Link, Avatar)
├── pages/          # Страницы приложения
├── utils/          # Валидация
└── assets/         # Стили и шрифты
```

## Скрипты

```bash
npm install          # Установка зависимостей
npm run dev          # Dev-сервер на http://localhost:3000
npm run start        # Сборка + preview
npm run build        # Сборка
npm run validate     # Проверка типов + линтинг
```

## Деплой

https://scintillating-strudel-fa2ed9.netlify.app

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

- **TypeScript** — статическая типизация
- **Vite** — сборка проекта
- **Handlebars** — шаблонизация компонентов
- **SCSS** — стилизация
- **ESLint + Stylelint** — линтинг кода и стилей
- **Vitest** — unit-тестирование
- **WebSocket** — real-time сообщения
- **Husky + lint-staged** — pre-commit хуки
- **Yandex Praktikum API** — бэкенд (`https://ya-praktikum.tech/api/v2`)

## Архитектура

- Компонентный подход: базовый класс `Block` с lifecycle-методами и `EventBus`
- SPA-роутер (Singleton + Builder паттерны)
- HTTP-транспорт на основе `XMLHttpRequest` с поддержкой JSON и FormData
- WebSocket-транспорт для real-time сообщений с автоматическим пингом
- API-сервисы: `AuthAPI`, `UserAPI`, `ChatAPI`

## Структура проекта

```
src/
├── api/            # API-сервисы (AuthAPI, UserAPI, ChatAPI)
├── core/           # Block, EventBus, Router, Route, HTTPTransport, WebSocketTransport
│   ├── Block.test.ts          # Тесты компонента и шаблонизатора
│   ├── EventBus.test.ts       # Тесты событийной шины
│   ├── HTTPTransport.test.ts  # Тесты модуля HTTP-запросов
│   └── Router.test.ts         # Тесты роутера
├── components/     # Переиспользуемые компоненты (Input, Button, Form, Link, Avatar)
├── pages/          # Страницы приложения
├── utils/          # Валидация и утилиты
└── assets/         # Стили и шрифты
```

## Скрипты

```bash
npm install           # Установка зависимостей
npm run dev           # Dev-сервер на http://localhost:3000
npm run start         # Сборка + preview
npm run build         # Production-сборка
npm run typecheck     # Проверка типов TypeScript
npm run lint          # Линтинг TypeScript
npm run lint:styles   # Линтинг SCSS
npm run validate      # Полная проверка: типы + оба линтера
```

## Тесты

Тесты написаны на **Vitest** и расположены рядом с тестируемыми файлами (в той же директории).

Покрытие:
- **EventBus** — событийная шина (`on`, `emit`, `off`)
- **HTTPTransport** — HTTP-клиент (GET, POST, PUT, DELETE, обработка ошибок, заголовки)
- **Router** — SPA-роутер (навигация, singleton, поиск маршрутов)
- **Block + Handlebars** — базовый компонент и шаблонизатор (compile, props, события, дочерние компоненты, XSS-защита)

```bash
npm test              # Запустить все тесты однократно
npm run test:watch    # Запустить тесты в режиме наблюдения (при разработке)
npm run test:coverage # Запустить тесты с отчётом покрытия
```

## Pre-commit хуки

Перед каждым коммитом автоматически запускаются:
1. **ESLint** — проверка и автоисправление TypeScript-файлов
2. **Stylelint** — проверка и автоисправление SCSS-файлов
3. **TypeScript** — проверка типов (`tsc --noEmit`)

Инициализация (выполнить один раз после `npm install`):
```bash
npm run prepare
```

## Деплой

Спринт 3: https://deploy-preview-3--lively-crisp-459a46.netlify.app

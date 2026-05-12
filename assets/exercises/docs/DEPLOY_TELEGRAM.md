# Деплой и подключение Telegram Mini App

## 1. Загрузка на GitHub

1. Открой GitHub на компьютере.
2. Создай новый репозиторий: `sustav-plus-miniapp`.
3. Загрузи все файлы из папки:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `manifest.json`
   - `README.md`
   - папку `docs`
   - папку `api`

## 2. Деплой на Vercel

Самый простой вариант:

1. Зайди на Vercel.
2. Нажми `Add New Project`.
3. Выбери GitHub-репозиторий `sustav-plus-miniapp`.
4. Framework Preset можно оставить `Other`.
5. Build command — пусто.
6. Output directory — пусто или `/`.
7. Нажми Deploy.
8. Получи ссылку вида:

```text
https://sustav-plus-miniapp.vercel.app
```

## 3. AI-помощник: пока можно не подключать

В версии v0.3 AI-экран работает даже без OpenAI API: приложение использует локальные тестовые подсказки.

Если хочешь подключить настоящий OpenAI API через Vercel:

1. Vercel → Project → Settings → Environment Variables.
2. Добавь:

```text
OPENAI_API_KEY=твой_ключ
OPENAI_MODEL=модель_из_твоего_аккаунта
```

3. Перезапусти Deploy.
4. Экран `AI` начнёт обращаться к `/api/assistant`.

Важно: API-ключ нельзя хранить в `app.js`, `index.html` или публичном GitHub-коде.

## 4. Создание Telegram-бота

1. Открой Telegram.
2. Найди `@BotFather`.
3. Напиши:

```text
/newbot
```

4. Название: `Сустав+`
5. Username, например:

```text
sustavplus_app_bot
```

6. Сохрани токен. Не публикуй его в открытом доступе.

## 5. Подключение Mini App к боту

В `@BotFather`:

1. `/mybots`
2. Выбери бота.
3. `Bot Settings`
4. `Menu Button` или `Configure Mini App`
5. Вставь HTTPS-ссылку приложения.
6. Название кнопки:

```text
Открыть Сустав+
```

## 6. Проверка

Открой бота в Telegram и нажми кнопку меню. Приложение должно открыться внутри Telegram.

Проверь экраны:

- Главная;
- Маршрут 14/30 дней;
- Режим дня;
- Трекер;
- AI;
- Профиль.

## 7. Реферальные ссылки

Когда бот готов, можно использовать:

```text
https://t.me/sustavplus_app_bot?startapp=elkin
https://t.me/sustavplus_app_bot?startapp=savinkov
https://t.me/sustavplus_app_bot?startapp=karpovich
```

В тестовой версии источник отображается на экране `Профиль`.

## 8. Что подключать потом

- Backend / база данных: Supabase или Firebase.
- Авторизация через Telegram `initData`.
- Оплата: Telegram Stars.
- Админка для редактирования маршрутов и упражнений.
- Личный кабинет врача/партнёра.
- Аналитика: переходы, открытия, заявки, покупки.
- AI-модерация красных флагов и уведомление админа.


## Реферальные и медиа-ссылки v0.6

После подключения Mini App можно давать разные ссылки для разных источников:

```text
https://t.me/USERNAME_BOT?startapp=newsustav
https://t.me/USERNAME_BOT?startapp=youtube
https://t.me/USERNAME_BOT?startapp=site
https://t.me/USERNAME_BOT?startapp=vk
https://t.me/USERNAME_BOT?startapp=elkin
https://t.me/USERNAME_BOT?startapp=savinkov
https://t.me/USERNAME_BOT?startapp=karpovich
https://t.me/USERNAME_BOT?startapp=victoria
```

В тестовой версии источник сохраняется локально в браузере/Telegram WebView. Для полноценной статистики позже подключается backend и база.

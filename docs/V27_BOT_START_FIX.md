# Sustav+ v2.7 — Telegram /start button fix

Добавлен файл `api/bot.js`.

Что он делает:
- отвечает на `/start`;
- отправляет кнопку `Открыть Сустав+`;
- кнопка открывает Mini App через Telegram WebApp;
- добавляет кнопку `Написать Виталию`;
- если пользователь пишет обычный текст, бот тоже не молчит, а отправляет кнопку приложения.

## Что нужно сделать в Vercel

1. Открыть проект `sustav-plus-miniapp` в Vercel.
2. Перейти в `Settings` → `Environment Variables`.
3. Добавить переменную:

```text
TELEGRAM_BOT_TOKEN=ваш_токен_из_BotFather
```

Дополнительно можно добавить:

```text
WEB_APP_URL=https://sustav-plus-miniapp.vercel.app/?v=27
SUPPORT_URL=https://t.me/newsustav
```

4. Нажать `Redeploy`.

## Как поставить webhook

После деплоя открыть в браузере ссылку:

```text
https://api.telegram.org/botВАШ_ТОКЕН/setWebhook?url=https://sustav-plus-miniapp.vercel.app/api/bot
```

Если всё хорошо, Telegram ответит `ok: true`.

## Проверка

Откройте `@sustavplus_app_bot` и отправьте:

```text
/start
```

Бот должен отправить сообщение и кнопку `Открыть Сустав+`.

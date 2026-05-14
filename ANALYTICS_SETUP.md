# Сустав+ Mini App v0.6 — автор проекта и источники входа

## Что добавлено

### 1. Карточка автора проекта
Добавлен отдельный экран **«Виталий Клочихин»**:
- роль автора проекта;
- личный опыт восстановления;
- Telegram-канал @newsustav;
- YouTube-канал Виталия;
- сайт newsustav.ru;
- Telegraph «Путь без боли».

### 2. Отдельный источник входа
Приложение теперь показывает пользователю и администратору источник входа:
- `?startapp=newsustav` — Telegram-канал @newsustav;
- `?startapp=youtube` — YouTube-канал;
- `?startapp=site` — сайт;
- `?startapp=vk` — VK;
- `?startapp=elkin`, `savinkov`, `karpovich` — будущие партнёрские ссылки врачей;
- `?startapp=victoria` — нутрициолог Виктория Клочихина.

### 3. Контакты стали сильнее
Экран **«Контакты»** теперь начинается с блока автора проекта и кнопки перехода в карточку Виталия.

### 4. Главный экран
На главный экран добавлена быстрая кнопка **«Автор проекта»** и карточка **«Виталий Клочихин»**.

## Как тестировать источники
После деплоя на Vercel можно открыть приложение с параметрами:

```text
https://ваш-домен.vercel.app?startapp=newsustav
https://ваш-домен.vercel.app?startapp=youtube
https://ваш-домен.vercel.app?startapp=site
```

В Telegram через бота в будущем:

```text
https://t.me/username_bot?startapp=newsustav
https://t.me/username_bot?startapp=youtube
https://t.me/username_bot?startapp=elkin
```

## Важно
Пока это статическая тестовая версия без backend. Источник сохраняется в `localStorage`. Для настоящей аналитики позже нужен backend: база, события, заявки, партнёрские переходы.

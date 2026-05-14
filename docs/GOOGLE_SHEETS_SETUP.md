# Сустав+ v1.6 — Google Sheets аналитика

Эта версия уже отправляет события в `/api/track`.
Чтобы они попадали в Google Sheets, нужно один раз создать таблицу и подключить Web App URL в Vercel.

## 1. Создать таблицу

1. Открой Google Sheets.
2. Создай новую таблицу.
3. Назови её: `Sustav+ Analytics`.

## 2. Вставить Apps Script

1. В таблице нажми: **Extensions → Apps Script**.
2. Удали всё, что там есть.
3. Вставь код из файла:

```text
google-apps-script/Code.gs
```

4. Нажми **Save**.

## 3. Опубликовать Web App

1. В Apps Script нажми **Deploy → New deployment**.
2. Тип выбери **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone**.
5. Нажми **Deploy**.
6. Разреши доступ Google-аккаунту.
7. Скопируй **Web app URL**.

## 4. Добавить URL в Vercel

В Vercel:

```text
sustav-plus-miniapp → Settings → Environment Variables
```

Добавь переменную:

```text
GOOGLE_SHEETS_WEBHOOK_URL = твой Web app URL
```

Environment: **Production**.

Потом сделай **Redeploy** последнего Production-деплоя.

## 5. Проверка

1. Открой приложение:
```text
https://sustav-plus-miniapp.vercel.app?v=16
```

2. Покликай несколько разделов:
- Главная
- Питание
- Как похудеть безопасно
- Упражнения
- Готовлюсь к операции

3. Открой Google Sheet.
4. В листе `events` должны появляться строки.

## Что будет в таблице

Лист `events`:

```text
received_at
event
time
appVersion
source
sourceLabel
screen
program
day
exerciseId
visitorId
sessionId
tgUserId
tgUsername
tgFirstName
startParam
platform
language
path
url
userAgent
data_json
```

Лист `summary`:

- общее число событий;
- уникальные посетители;
- события по типам;
- экраны по просмотрам.

## Важно

Не собирай лишние медицинские данные через аналитику.
Аналитика нужна для поведения в продукте: кто зашёл, какой раздел открыл, куда нажал.

# Google Sheets Analytics для Сустав+

Это самый простой способ бесплатно видеть клики в таблице.

## 1. Создай Google Sheet

Создай таблицу и назови лист `events`.

## 2. Открой Apps Script

В Google Sheet: **Extensions → Apps Script**.

Вставь код:

```javascript
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('events');
  if (!sheet) sheet = ss.insertSheet('events');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'received_at',
      'event',
      'time',
      'appVersion',
      'source',
      'sourceLabel',
      'screen',
      'program',
      'day',
      'exerciseId',
      'visitorId',
      'sessionId',
      'tgUserId',
      'tgUsername',
      'tgFirstName',
      'data',
      'url',
      'userAgent'
    ]);
  }

  const body = JSON.parse(e.postData.contents || '{}');

  sheet.appendRow([
    new Date(),
    body.event || '',
    body.time || '',
    body.appVersion || '',
    body.source || '',
    body.sourceLabel || '',
    body.screen || '',
    body.program || '',
    body.day || '',
    body.exerciseId || '',
    body.visitorId || '',
    body.sessionId || '',
    body.telegram && body.telegram.tgUserId || '',
    body.telegram && body.telegram.tgUsername || '',
    body.telegram && body.telegram.tgFirstName || '',
    JSON.stringify(body.data || {}),
    body.url || '',
    body.userAgent || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. Опубликуй как Web App

В Apps Script:

1. **Deploy → New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Deploy
6. Скопируй URL вида `https://script.google.com/macros/s/.../exec`

## 4. Добавь URL в Vercel

Vercel → Project → Settings → Environment Variables:

```text
ANALYTICS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
```

Сохрани и сделай **Redeploy**.

## 5. Что смотреть в таблице

- `event = app_open` — сколько людей открыло приложение;
- `event = screen_view` — какие разделы смотрят;
- `event = exercise_open` — какие упражнения открывают;
- `event = tracker_save` — кто реально пользуется трекером;
- `source` — откуда пришли: Telegram, YouTube, врач, сайт.

Для быстрого анализа можно сделать фильтры или сводную таблицу по колонкам `event`, `source`, `screen`.

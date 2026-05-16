# Сустав+ v1.7.3 — диагностика Google Sheets

Что добавлено:

- `/api/track` теперь пишет в Vercel Logs отдельную строку:
  - `[sustav-analytics-event]`
  - `[sustav-webhook-result]`
  - `[sustav-telegram-result]`

- добавлен тестовый endpoint:

```text
/api/test-sheets
```

После деплоя открой:

```text
https://sustav-plus-miniapp.vercel.app/api/test-sheets
```

## Как читать результат

### 1. envPresent: false

Vercel не видит переменную:

```text
GOOGLE_SHEETS_WEBHOOK_URL
```

Что делать:

- Vercel → Environment Variables
- добавить GOOGLE_SHEETS_WEBHOOK_URL
- Deployments → Redeploy

### 2. googleStatus: 200 и ok: true

Связь с Google Sheets работает. В таблице должна появиться строка:

```text
event = test_google_sheets
```

### 3. googleStatus: 401 / 403

Google Apps Script не открыт для доступа.

Что делать:

- Apps Script → Deploy → Manage deployments → Edit
- Execute as: Me
- Who has access: Anyone
- Version: New version
- Deploy

### 4. ok: false с ошибкой fetch

Проблема с URL или доступностью Google Apps Script.

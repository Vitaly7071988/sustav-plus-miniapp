# Сустав+ v1.7.1 — анкеты в Google Sheets отдельным листом

В этой версии Google Sheets получает не только события в `events`, но и отдельный лист `profiles`.

## Что появится в таблице

Листы:

- `events` — все события: входы, экраны, клики, упражнения, трекер.
- `profiles` — анкеты людей отдельными колонками.
- `summary` — краткая сводка.

## Что будет в `profiles`

Колонки:

- profileName
- profileTelegramUsername
- tgUsername
- tgFirstName
- stage
- joint
- operationDate
- cityClinic
- daysAfter
- support
- mainGoal
- painConcern
- nutritionGoal
- rehabGoal
- needHelp
- restrictions
- source
- sourceLabel

Если один и тот же пользователь обновит анкету, строка в `profiles` обновится, а не будет бесконечно дублироваться.

## Что нужно сделать

1. Загрузить архив v1.7.1 в GitHub.
2. Дождаться Vercel Deploy.
3. Открыть Google Sheets → Расширения → Apps Script.
4. Заменить старый код на новый код из файла:

```text
google-apps-script/Code.gs
```

5. Нажать сохранить.
6. Нажать Deploy → Manage deployments → Edit → New version → Deploy.
7. В Vercel переменную `GOOGLE_SHEETS_WEBHOOK_URL` менять не нужно, если URL Web App остался тот же.
8. Сделать Redeploy в Vercel.
9. Открыть приложение с хвостом:

```text
https://sustav-plus-miniapp.vercel.app?v=171
```

10. Заполнить анкету тестово и проверить лист `profiles`.

## Важно

Анкета содержит чувствительные около-медицинские данные. Не публикуй таблицу в открытом доступе и не собирай лишнее.

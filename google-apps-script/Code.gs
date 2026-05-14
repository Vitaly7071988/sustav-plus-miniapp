/**
 * Сустав+ Analytics → Google Sheets
 *
 * Как использовать:
 * 1. Создайте Google Sheet: "Sustav+ Analytics".
 * 2. Extensions → Apps Script.
 * 3. Вставьте этот код в Code.gs.
 * 4. Deploy → New deployment → Web app.
 *    Execute as: Me.
 *    Who has access: Anyone.
 * 5. Скопируйте Web app URL и вставьте его в Vercel:
 *    GOOGLE_SHEETS_WEBHOOK_URL = <ваш URL>
 */

const EVENTS_SHEET = 'events';
const SUMMARY_SHEET = 'summary';

const HEADERS = [
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
  'startParam',
  'platform',
  'language',
  'path',
  'url',
  'userAgent',
  'data_json'
];

function doGet() {
  setupSheets_();
  return json_({
    ok: true,
    service: 'Sustav+ Analytics',
    message: 'Google Sheets webhook is ready',
    sheets: [EVENTS_SHEET, SUMMARY_SHEET]
  });
}

function doPost(e) {
  try {
    setupSheets_();

    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const body = JSON.parse(raw);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(EVENTS_SHEET);

    const row = [
      new Date(),
      clean_(body.event),
      clean_(body.time),
      clean_(body.appVersion),
      clean_(body.source),
      clean_(body.sourceLabel),
      clean_(body.screen),
      clean_(body.program),
      clean_(body.day),
      clean_(body.exerciseId),
      clean_(body.visitorId),
      clean_(body.sessionId),
      clean_(body.telegram && body.telegram.tgUserId),
      clean_(body.telegram && body.telegram.tgUsername),
      clean_(body.telegram && body.telegram.tgFirstName),
      clean_(body.telegram && body.telegram.startParam),
      clean_(body.telegram && body.telegram.platform),
      clean_(body.language),
      clean_(body.path),
      clean_(body.url),
      clean_(body.userAgent),
      JSON.stringify(body.data || {})
    ];

    sheet.appendRow(row);
    updateSummary_(body);

    return json_({ ok: true, appended: true, event: body.event || 'unknown' });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function setupSheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let events = ss.getSheetByName(EVENTS_SHEET);
  if (!events) events = ss.insertSheet(EVENTS_SHEET);

  if (events.getLastRow() === 0) {
    events.appendRow(HEADERS);
    events.setFrozenRows(1);
  }

  let summary = ss.getSheetByName(SUMMARY_SHEET);
  if (!summary) summary = ss.insertSheet(SUMMARY_SHEET);

  if (summary.getLastRow() === 0) {
    summary.appendRow(['metric', 'value', 'updated_at']);
    summary.setFrozenRows(1);
  }
}

function updateSummary_(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const events = ss.getSheetByName(EVENTS_SHEET);
  const summary = ss.getSheetByName(SUMMARY_SHEET);

  const lastRow = events.getLastRow();
  const data = lastRow > 1 ? events.getRange(2, 1, lastRow - 1, HEADERS.length).getValues() : [];

  const visitorSet = {};
  const eventCount = {};
  const screenCount = {};

  data.forEach(row => {
    const eventName = row[1] || 'unknown';
    const screen = row[6] || '-';
    const visitor = row[10] || row[11] || '-';

    visitorSet[visitor] = true;
    eventCount[eventName] = (eventCount[eventName] || 0) + 1;
    screenCount[screen] = (screenCount[screen] || 0) + 1;
  });

  summary.clearContents();
  summary.appendRow(['metric', 'value', 'updated_at']);
  summary.appendRow(['events_total', data.length, new Date()]);
  summary.appendRow(['visitors_unique', Object.keys(visitorSet).length, new Date()]);

  Object.keys(eventCount).sort().forEach(key => {
    summary.appendRow(['event:' + key, eventCount[key], new Date()]);
  });

  Object.keys(screenCount).sort().forEach(key => {
    summary.appendRow(['screen:' + key, screenCount[key], new Date()]);
  });
}

function clean_(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, 500);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

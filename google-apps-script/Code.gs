/**
 * Сустав+ Analytics → Google Sheets
 * v1.7.1: events + readable profiles sheet
 *
 * Листы:
 * - events: все события
 * - profiles: последняя анкета пользователя отдельными колонками
 * - summary: сводка
 */

const EVENTS_SHEET = 'events';
const PROFILES_SHEET = 'profiles';
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

const PROFILE_HEADERS = [
  'updated_at',
  'event',
  'visitorId',
  'sessionId',
  'tgUserId',
  'tgUsername',
  'tgFirstName',
  'profileName',
  'profileTelegramUsername',
  'stage',
  'joint',
  'operationDate',
  'cityClinic',
  'daysAfter',
  'support',
  'mainGoal',
  'painConcern',
  'nutritionGoal',
  'rehabGoal',
  'needHelp',
  'restrictions',
  'consentProfile',
  'profileCompletedAt',
  'source',
  'sourceLabel',
  'startParam',
  'appVersion',
  'raw_json'
];

function doGet() {
  setupSheets_();
  return json_({
    ok: true,
    service: 'Sustav+ Analytics',
    message: 'Google Sheets webhook is ready',
    sheets: [EVENTS_SHEET, PROFILES_SHEET, SUMMARY_SHEET]
  });
}

function doPost(e) {
  try {
    setupSheets_();

    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const body = JSON.parse(raw);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const events = ss.getSheetByName(EVENTS_SHEET);

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

    events.appendRow(row);

    if (body.event === 'profile_created' || body.event === 'profile_updated') {
      upsertProfile_(body);
    }

    updateSummary_();

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

  let profiles = ss.getSheetByName(PROFILES_SHEET);
  if (!profiles) profiles = ss.insertSheet(PROFILES_SHEET);
  if (profiles.getLastRow() === 0) {
    profiles.appendRow(PROFILE_HEADERS);
    profiles.setFrozenRows(1);
  }

  let summary = ss.getSheetByName(SUMMARY_SHEET);
  if (!summary) summary = ss.insertSheet(SUMMARY_SHEET);
  if (summary.getLastRow() === 0) {
    summary.appendRow(['metric', 'value', 'updated_at']);
    summary.setFrozenRows(1);
  }
}

function upsertProfile_(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const profiles = ss.getSheetByName(PROFILES_SHEET);
  const data = body.data || {};
  const tg = body.telegram || {};

  const visitorId = clean_(body.visitorId || tg.tgUserId || body.sessionId || '');
  const row = [
    new Date(),
    clean_(body.event),
    visitorId,
    clean_(body.sessionId),
    clean_(tg.tgUserId),
    clean_(tg.tgUsername),
    clean_(tg.tgFirstName),
    clean_(data.profileName),
    clean_(data.telegramUsername),
    clean_(data.stage),
    clean_(data.joint),
    clean_(data.operationDate),
    clean_(data.cityClinic),
    clean_(data.daysAfter),
    clean_(data.support),
    clean_(data.mainGoal),
    clean_(data.painConcern, 1000),
    clean_(data.nutritionGoal),
    clean_(data.rehabGoal),
    clean_(data.needHelp),
    clean_(data.restrictions, 1000),
    clean_(data.consentProfile),
    clean_(data.profileCompletedAt),
    clean_(body.source),
    clean_(body.sourceLabel),
    clean_(tg.startParam),
    clean_(body.appVersion),
    JSON.stringify(data || {})
  ];

  const lastRow = profiles.getLastRow();
  if (lastRow > 1 && visitorId) {
    const visitorValues = profiles.getRange(2, 3, lastRow - 1, 1).getValues();
    for (let i = 0; i < visitorValues.length; i++) {
      if (String(visitorValues[i][0]) === visitorId) {
        profiles.getRange(i + 2, 1, 1, PROFILE_HEADERS.length).setValues([row]);
        return;
      }
    }
  }

  profiles.appendRow(row);
}

function updateSummary_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const events = ss.getSheetByName(EVENTS_SHEET);
  const profiles = ss.getSheetByName(PROFILES_SHEET);
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
  summary.appendRow(['profiles_total', Math.max((profiles.getLastRow() || 1) - 1, 0), new Date()]);

  Object.keys(eventCount).sort().forEach(key => {
    summary.appendRow(['event:' + key, eventCount[key], new Date()]);
  });

  Object.keys(screenCount).sort().forEach(key => {
    summary.appendRow(['screen:' + key, screenCount[key], new Date()]);
  });
}

function clean_(value, max) {
  if (value === null || value === undefined) return '';
  const limit = max || 500;
  return String(value).replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, limit);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

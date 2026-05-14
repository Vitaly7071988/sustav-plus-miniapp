// Сустав+ Analytics endpoint v1.6 — Google Sheets ready
// Receives frontend events and optionally forwards them to:
// 1) Google Sheets / Make / Zapier webhook: GOOGLE_SHEETS_WEBHOOK_URL or ANALYTICS_WEBHOOK_URL
// 2) Telegram admin chat: TELEGRAM_BOT_TOKEN + ANALYTICS_CHAT_ID
// No personal medical data is required. Keep analytics focused on product behavior.

const DEFAULT_TELEGRAM_EVENTS = new Set([
  'app_open',
  'program_open',
  'exercise_open',
  'tracker_save',
  'assistant_ask',
  'external_click'
]);

function safeString(value, max = 220) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, max);
}

function pickEvent(body) {
  return {
    event: safeString(body.event || 'unknown', 80),
    time: safeString(body.time || new Date().toISOString(), 40),
    appVersion: safeString(body.appVersion || '', 50),
    source: safeString(body.source || 'direct', 80),
    sourceLabel: safeString(body.sourceLabel || '', 140),
    screen: safeString(body.screen || '', 60),
    program: body.program ?? null,
    day: body.day ?? null,
    exerciseId: safeString(body.exerciseId || '', 80),
    sessionId: safeString(body.sessionId || '', 120),
    visitorId: safeString(body.visitorId || '', 120),
    telegram: {
      platform: safeString(body.telegram?.platform || '', 30),
      tgUserId: safeString(body.telegram?.tgUserId || '', 80),
      tgUsername: safeString(body.telegram?.tgUsername || '', 80),
      tgFirstName: safeString(body.telegram?.tgFirstName || '', 80),
      startParam: safeString(body.telegram?.startParam || '', 80)
    },
    data: body.data || {},
    url: safeString(body.url || '', 260),
    path: safeString(body.path || '', 160),
    userAgent: safeString(body.userAgent || '', 220),
    language: safeString(body.language || '', 40)
  };
}

function shouldSendToTelegram(eventName) {
  const setting = process.env.ANALYTICS_TELEGRAM_EVENTS || '';
  if (setting.trim().toLowerCase() === 'all') return true;
  if (setting.trim()) {
    return setting.split(',').map(x => x.trim()).filter(Boolean).includes(eventName);
  }
  return DEFAULT_TELEGRAM_EVENTS.has(eventName);
}

async function forwardToWebhook(event) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.ANALYTICS_WEBHOOK_URL;
  if (!url) return { skipped: true, reason: 'GOOGLE_SHEETS_WEBHOOK_URL / ANALYTICS_WEBHOOK_URL is not set' };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });

  let text = '';
  try { text = await response.text(); } catch (_) {}

  return {
    ok: response.ok,
    status: response.status,
    target: process.env.GOOGLE_SHEETS_WEBHOOK_URL ? 'google_sheets' : 'analytics_webhook',
    response: text.slice(0, 240)
  };
}

async function notifyTelegram(event) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.ANALYTICS_CHAT_ID;
  if (!token || !chatId || !shouldSendToTelegram(event.event)) return { skipped: true };

  const data = event.data || {};
  const lines = [
    `📊 Сустав+ аналитика`,
    `Событие: ${event.event}`,
    `Экран: ${event.screen || '-'}`,
    `Источник: ${event.source || '-'}`,
    `Пользователь: ${event.telegram.tgUsername ? '@' + event.telegram.tgUsername : event.telegram.tgFirstName || event.visitorId || '-'}`,
    `Программа/день: ${event.program || '-'} / ${event.day || '-'}`,
    event.exerciseId ? `Упражнение: ${event.exerciseId}` : '',
    data.href ? `Ссылка: ${data.href}` : '',
    data.to ? `Переход: ${data.to}` : '',
    data.pain !== undefined ? `Боль: ${data.pain}/10` : '',
    `Время: ${event.time}`
  ].filter(Boolean);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines.join('\n'),
      disable_web_page_preview: true
    })
  });
  return { ok: response.ok, status: response.status };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const event = pickEvent(req.body || {});
    console.log('[sustav-analytics]', JSON.stringify(event));

    const [webhook, telegram] = await Promise.allSettled([
      forwardToWebhook(event),
      notifyTelegram(event)
    ]);

    return res.status(200).json({
      ok: true,
      received: event.event,
      webhook: webhook.status === 'fulfilled' ? webhook.value : { error: String(webhook.reason) },
      telegram: telegram.status === 'fulfilled' ? telegram.value : { error: String(telegram.reason) }
    });
  } catch (error) {
    console.error('[sustav-analytics-error]', error);
    return res.status(200).json({ ok: false, error: String(error?.message || error) });
  }
}

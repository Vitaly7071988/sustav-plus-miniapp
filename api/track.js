// Сустав+ Analytics endpoint v1.7.3 — Google Sheets debug
// Receives frontend events and forwards them to Google Sheets webhook if GOOGLE_SHEETS_WEBHOOK_URL is set.

const DEFAULT_TELEGRAM_EVENTS = new Set([
  'app_open',
  'program_open',
  'exercise_open',
  'tracker_save',
  'assistant_ask',
  'external_click',
  'profile_created',
  'profile_updated'
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

function getWebhookUrl() {
  return process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.ANALYTICS_WEBHOOK_URL || '';
}

async function forwardToWebhook(event) {
  const url = getWebhookUrl();

  if (!url) {
    return {
      skipped: true,
      envPresent: false,
      reason: 'GOOGLE_SHEETS_WEBHOOK_URL / ANALYTICS_WEBHOOK_URL is not set'
    };
  }

  try {
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
      envPresent: true,
      target: process.env.GOOGLE_SHEETS_WEBHOOK_URL ? 'GOOGLE_SHEETS_WEBHOOK_URL' : 'ANALYTICS_WEBHOOK_URL',
      response: text.slice(0, 500)
    };
  } catch (error) {
    return {
      ok: false,
      envPresent: true,
      error: String(error?.message || error)
    };
  }
}

function shouldSendToTelegram(eventName) {
  const setting = process.env.ANALYTICS_TELEGRAM_EVENTS || '';
  if (setting.trim().toLowerCase() === 'all') return true;
  if (setting.trim()) {
    return setting.split(',').map(x => x.trim()).filter(Boolean).includes(eventName);
  }
  return DEFAULT_TELEGRAM_EVENTS.has(eventName);
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

  try {
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
  } catch (error) {
    return { ok: false, error: String(error?.message || error) };
  }
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
    console.log('[sustav-analytics-event]', JSON.stringify({
      event: event.event,
      screen: event.screen,
      appVersion: event.appVersion,
      envPresent: !!getWebhookUrl()
    }));

    const webhook = await forwardToWebhook(event);
    console.log('[sustav-webhook-result]', JSON.stringify(webhook));

    const telegram = await notifyTelegram(event);
    console.log('[sustav-telegram-result]', JSON.stringify(telegram));

    return res.status(200).json({
      ok: true,
      received: event.event,
      webhook,
      telegram
    });
  } catch (error) {
    console.error('[sustav-analytics-error]', error);
    return res.status(200).json({ ok: false, error: String(error?.message || error) });
  }
}

// Sustav+ Telegram bot webhook for Vercel
// Handles /start and sends a reliable WebApp button.

const DEFAULT_WEB_APP_URL = 'https://sustav-plus-miniapp.vercel.app/?v=27';
const DEFAULT_SUPPORT_URL = 'https://t.me/newsustav';

async function telegramRequest(token, method, payload) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.ok === false) {
    throw new Error(`Telegram ${method} failed: ${JSON.stringify(data)}`);
  }

  return data;
}

function buildReplyMarkup(webAppUrl, supportUrl) {
  return {
    inline_keyboard: [
      [
        {
          text: 'Открыть Сустав+',
          web_app: { url: webAppUrl },
        },
      ],
      [
        {
          text: 'Написать Виталию',
          url: supportUrl,
        },
      ],
    ],
  };
}

function buildStartText() {
  return [
    'Сустав+ — эндопротезирование без хаоса.',
    '',
    'Это бесплатный цифровой проводник до и после операции: маршрут, упражнения, трекер, вопросы врачу, красные флаги и помощь близким.',
    '',
    'Нажмите кнопку ниже, чтобы открыть приложение.',
    '',
    'Важно: Сустав+ не заменяет врача, хирурга или реабилитолога. Это навигация и поддержка, чтобы человеку было проще понять следующий шаг.',
  ].join('\n');
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      service: 'Sustav+ Telegram bot webhook',
      hint: 'Use POST from Telegram webhook.',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webAppUrl = process.env.WEB_APP_URL || DEFAULT_WEB_APP_URL;
  const supportUrl = process.env.SUPPORT_URL || DEFAULT_SUPPORT_URL;

  if (!token) {
    console.error('[sustav-bot] TELEGRAM_BOT_TOKEN is missing');
    return res.status(200).json({ ok: true, warning: 'TELEGRAM_BOT_TOKEN is missing' });
  }

  try {
    const update = req.body || {};
    const message = update.message || update.edited_message;

    if (!message || !message.chat || !message.chat.id) {
      return res.status(200).json({ ok: true, skipped: true });
    }

    const chatId = message.chat.id;
    const text = (message.text || '').trim();

    // Reply to /start and also to regular text, so people never see silence.
    if (text === '/start' || text.startsWith('/start ') || text === '/help' || text.length > 0) {
      await telegramRequest(token, 'sendMessage', {
        chat_id: chatId,
        text: buildStartText(),
        parse_mode: 'HTML',
        reply_markup: buildReplyMarkup(webAppUrl, supportUrl),
        disable_web_page_preview: true,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[sustav-bot-error]', error);
    // Telegram expects 200 to avoid repeated retries in some cases.
    return res.status(200).json({ ok: true, error: String(error && error.message ? error.message : error) });
  }
}

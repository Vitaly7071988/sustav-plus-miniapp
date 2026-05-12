// Optional future backend for Vercel: /api/assistant
// Do NOT put OpenAI API keys into app.js, index.html, GitHub public code or Telegram Mini App frontend.
// Add environment variables in Vercel:
// OPENAI_API_KEY=...
// OPENAI_MODEL=gpt-4.1-mini or another available model in your OpenAI account.

const SAFETY_SYSTEM_PROMPT = `
Ты — AI-помощник Telegram Mini App "Сустав+".
Роль: навигатор восстановления после операции на суставе, НЕ врач.

Главные правила:
1. Не ставь диагнозы, не назначай лекарства, дозировки, уколы, БАДы, обследования и не отменяй назначения врача.
2. Не обещай результат и не говори "точно можно" или "точно нельзя" без привязки к назначениям врача/хирурга/реабилитолога.
3. При красных флагах сразу направляй к врачу/скорой: боль в груди, выраженная одышка, резкий отёк ноги, сильная нарастающая боль, высокая температура, внезапная слабость, подозрение на инфекцию/тромбоз, выделения из раны, резкое ухудшение.
4. Отвечай коротко, спокойно, по шагам: что проверить, что снизить, что записать в трекер, когда связаться со специалистом.
5. Для упражнений: безопасная формула — не через резкую боль, без рывков, добавлять один параметр нагрузки за раз, сверяться с ограничениями после конкретной операции.
6. По воде: цель 3 литра — только если нет ограничений по почкам, сердцу, давлению, отёкам и назначениям врача.
Тон: заботливый, уверенный, простой русский язык.
`;

function extractOutputText(data) {
  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  try {
    const parts = [];
    for (const item of data.output || []) {
      for (const c of item.content || []) {
        if (c.text) parts.push(c.text);
        if (c.type === 'output_text' && c.text) parts.push(c.text);
      }
    }
    return parts.join('\n').trim();
  } catch (_) {
    return '';
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

  if (!apiKey) {
    return res.status(200).json({
      answer: 'AI-сервер пока не подключён: в Vercel нужно добавить OPENAI_API_KEY. Сейчас приложение использует локальные тестовые подсказки.'
    });
  }

  const { question = '', context = {} } = req.body || {};

  if (!String(question).trim()) {
    return res.status(200).json({ answer: 'Напишите вопрос: например, про боль после ходьбы, воду, дыхание или работу за столом.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        input: [
          { role: 'system', content: SAFETY_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Контекст пользователя: день ${context.day || '-'}, программа ${context.program || '-'} дней, последняя боль ${context.pain ?? '-'} из 10, вода сегодня ${context.waterMl || 0} мл.\n\nВопрос: ${question}`
          }
        ],
        max_output_tokens: 550
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(200).json({
        answer: `AI временно не ответил. Безопасная подсказка: снизьте нагрузку, отметьте боль/отёк в трекере и при красных флагах свяжитесь с врачом. Технически: ${errorText.slice(0, 180)}`
      });
    }

    const data = await response.json();
    const answer = extractOutputText(data) || 'Не смог сформировать ответ. Лучше уточнить вопрос или связаться со специалистом при ухудшении.';
    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(200).json({
      answer: 'AI временно недоступен. Безопасная подсказка: не делайте через резкую боль, снизьте нагрузку, отметьте состояние в трекере, а при красных флагах свяжитесь с врачом.'
    });
  }
}

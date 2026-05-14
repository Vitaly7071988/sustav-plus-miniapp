// Сустав+ Google Sheets test endpoint
// Open /api/test-sheets after redeploy to check webhook forwarding.

function getWebhookUrl() {
  return process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.ANALYTICS_WEBHOOK_URL || '';
}

export default async function handler(req, res) {
  const url = getWebhookUrl();

  if (!url) {
    return res.status(200).json({
      ok: false,
      step: 'env',
      envPresent: false,
      message: 'GOOGLE_SHEETS_WEBHOOK_URL is not set in Vercel environment variables, or deployment was not redeployed after adding it.'
    });
  }

  const testEvent = {
    event: 'test_google_sheets',
    time: new Date().toISOString(),
    appVersion: '1.7.3-sheets-debug',
    source: 'manual_test',
    sourceLabel: 'Manual test from /api/test-sheets',
    screen: 'api_test',
    program: null,
    day: null,
    exerciseId: '',
    sessionId: 'manual-test-session',
    visitorId: 'manual-test-visitor',
    telegram: {
      platform: '',
      tgUserId: '',
      tgUsername: '',
      tgFirstName: '',
      startParam: ''
    },
    data: {
      note: 'If you see this row in Google Sheets, the webhook works.'
    },
    url: '/api/test-sheets',
    path: '/api/test-sheets',
    userAgent: req.headers['user-agent'] || '',
    language: ''
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEvent)
    });

    const text = await response.text();

    console.log('[sustav-test-sheets]', JSON.stringify({
      envPresent: true,
      status: response.status,
      ok: response.ok,
      response: text.slice(0, 500)
    }));

    return res.status(200).json({
      ok: response.ok,
      step: 'webhook',
      envPresent: true,
      googleStatus: response.status,
      googleResponse: text.slice(0, 1000),
      expectedSheetRow: 'event = test_google_sheets'
    });
  } catch (error) {
    console.error('[sustav-test-sheets-error]', error);
    return res.status(200).json({
      ok: false,
      step: 'fetch',
      envPresent: true,
      error: String(error?.message || error)
    });
  }
}

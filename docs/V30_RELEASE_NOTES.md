# V30 Release Notes — image cache fix

- Replaced exercise images in `assets/exercises/` with the new 4-step visual cards.
- Added cache busting to exercise image URLs: `?v=30-img`.
- Keeps the full v2.9 merge, including v2.3 base, Google Sheets analytics, profile, route, tracker, family, nutrition, combo packs, and Telegram `/start` bot fix.
- Telegram bot token is still read from Vercel environment variable `TELEGRAM_BOT_TOKEN`; do not create a new token for each version.
- Recommended Mini App URL: `https://sustav-plus-miniapp.vercel.app/?v=30`.

# AdPulse — Next.js starter (Tailwind, GSAP, Three.js)

Что внутри:
- Next.js app (pages-based) with Tailwind CSS config
- GSAP animation hooks (hero)
- Three.js simple rotating sphere in hero
- Contact form that posts to `/api/contact` (SendGrid example)

Быстрый старт:
1. Установите зависимости:
   ```
   npm install
   ```
2. Запуск dev сервера:
   ```
   npm run dev
   ```
3. Переменные окружения (в `.env.local` в корне проекта):
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key
   CONTACT_EMAIL=you@domain.tld
   NEXT_PUBLIC_GOOGLE_ANALYTICS=G-XXXXXXX
   NEXT_PUBLIC_YANDEX_METRIKA=YYYYYYY
   ```
4. Деплой: подходит Vercel (рекомендуется) или Netlify.

Интеграции:
- **Отправка форм**: в примере используется SendGrid (API key требуется). Можно заменить на любую CRM или webhook.
- **Аналитика**: добавьте Google Analytics / Yandex Metrika ID в `.env.local` и включите в `pages/_document.js` или `pages/_app.js`.

Если хочешь — я могу:
- настроить CI/CD для автоматического деплоя на Vercel,
- сгенерировать видимоть бренда (цвета, шрифты) прямо в коде,
- подключить конкретную CRM (Bitrix24 / amoCRM / Pipedrive) — дай API-ключ/инструкции.

## CRM & Webhook integration


You can forward contact form submissions to any CRM by configuring one of the following environment variables:

- `CRM_WEBHOOK_URL` — a generic webhook endpoint (recommended). Example: a Make / Zapier webhook or your CRM incoming webhook.
- `CRM_PROVIDER` — set to 'pipedrive' or 'bitrix' and configure provider-specific env vars:
  - `PIPEDRIVE_API_TOKEN` — API token for Pipedrive.
  - `BITRIX_WEBHOOK_URL` — full Bitrix24 REST webhook URL (e.g. https://yourdomain.bitrix24.ru/rest/1/xxxxxxxxx/crm.lead.add.json)

The server will attempt to forward the lead after sending the notification email (if SendGrid is configured).

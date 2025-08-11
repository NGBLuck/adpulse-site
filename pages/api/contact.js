// API route: sends email via SendGrid (if configured) and optionally forwards lead to a CRM/webhook.
// Environment variables to configure:
// - SENDGRID_API_KEY (optional): if present, email will be sent.
// - CONTACT_EMAIL (required to receive emails when using SendGrid)
// - CRM_WEBHOOK_URL (optional): a generic webhook URL to forward the lead to (recommended for custom CRM / Zapier / Make)
// - CRM_PROVIDER (optional): 'pipedrive' | 'bitrix' | 'amo' (provider-specific env vars required)
// - PIPEDRIVE_API_TOKEN, BITRIX_WEBHOOK_URL, AMO_INTEGRATION_URL etc. (if using provider-specific flows)
const sgMail = require('@sendgrid/mail')
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

async function forwardToGenericWebhook(url, payload) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return { ok: res.ok, status: res.status }
  } catch (err) {
    console.error('Generic webhook error', err)
    return { ok: false, error: err.message }
  }
}

async function forwardToPipedrive(apiToken, payload) {
  // Minimal example: create a person using Pipedrive API.
  try {
    const personRes = await fetch(`https://api.pipedrive.com/v1/persons?api_token=${apiToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: payload.name, phone: payload.phone, email: payload.email || '' })
    })
    const personJson = await personRes.json()
    return { ok: personRes.ok, detail: personJson }
  } catch (err) {
    console.error('Pipedrive forward error', err)
    return { ok: false, error: err.message }
  }
}

async function forwardToBitrix(webhookUrl, payload) {
  // Bitrix24 usually accepts leads via REST webhook URL (crm.lead.add.json)
  try {
    const body = { title: `Заявка: ${payload.name}`, comments: payload.message || '', fields: { PHONE: [ { VALUE: payload.phone, VALUE_TYPE: 'WORK' } ], EMAIL: payload.email ? [ { VALUE: payload.email, VALUE_TYPE: 'WORK' } ] : [] } }
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    return { ok: res.ok, detail: data }
  } catch (err) {
    console.error('Bitrix forward error', err)
    return { ok: false, error: err.message }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { name, phone, email = '', service = '', project = '', message = '' } = req.body || {}
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' })

  const contactEmail = process.env.CONTACT_EMAIL || null
  const payload = { name, phone, email, service, project, message, receivedAt: new Date().toISOString() }

  // 1) Send email via SendGrid if configured
  if (process.env.SENDGRID_API_KEY && contactEmail) {
    const text = [
      `Новая заявка с сайта`,
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Email: ${email}`,
      `Услуга: ${service}`,
      `Проект / сообщение: ${project || message}`
    ].join('\n')

    const msg = {
      to: contactEmail,
      from: contactEmail,
      subject: `Новая заявка — ${name}`,
      text,
    }

    try {
      await sgMail.send(msg)
      console.log('SendGrid: email sent to', contactEmail)
    } catch (err) {
      console.error('SendGrid error', err)
    }
  }

  // 2) Forward to generic webhook if set (recommended for Zapier / Make / custom endpoints)
  if (process.env.CRM_WEBHOOK_URL) {
    const result = await forwardToGenericWebhook(process.env.CRM_WEBHOOK_URL, payload)
    console.log('CRM_WEBHOOK_URL forward result', result)
  } else if (process.env.CRM_PROVIDER) {
    // Provider-specific forwarding
    const provider = process.env.CRM_PROVIDER.toLowerCase()
    if (provider === 'pipedrive' && process.env.PIPEDRIVE_API_TOKEN) {
      await forwardToPipedrive(process.env.PIPEDRIVE_API_TOKEN, payload)
    } else if (provider === 'bitrix' && process.env.BITRIX_WEBHOOK_URL) {
      await forwardToBitrix(process.env.BITRIX_WEBHOOK_URL, payload)
    } else {
      console.log('CRM_PROVIDER set but required provider env vars missing or unsupported provider.')
    }
  } else {
    console.log('No CRM forwarding configured (CRM_WEBHOOK_URL or CRM_PROVIDER)')
  }

  return res.status(200).json({ ok: true })
}
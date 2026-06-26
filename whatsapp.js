// ============================================================
// MEME MASTERY ACADEMY — WhatsApp Auto-Access Module
// Called automatically from bot.js after payment confirmed
// Uses WhatsApp Cloud API (Meta) — free tier available
// ============================================================

const https = require('https');

const WA_CONFIG = {
  token:      process.env.WHATSAPP_API_TOKEN,
  phoneId:    process.env.WHATSAPP_PHONE_ID,
  groupLink:  process.env.WHATSAPP_GROUP_LINK,  // Single community group
};

// ── SEND A WHATSAPP MESSAGE ───────────────────────────────────
async function sendWhatsAppMessage(to, message) {
  // 'to' must be international format without +
  // e.g. Nigerian number 08012345678 becomes 2348012345678
  const body = JSON.stringify({
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: message },
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'graph.facebook.com',
      path:     `/v18.0/${WA_CONFIG.phoneId}/messages`,
      method:   'POST',
      headers: {
        'Authorization': `Bearer ${WA_CONFIG.token}`,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── WELCOME MESSAGE AFTER PAYMENT ────────────────────────────
async function sendWhatsAppAccess({ phoneNumber, firstName }) {
  if (!phoneNumber || !WA_CONFIG.token) return;

  const message =
`🎓 *Meme Mastery Academy*

Welcome, ${firstName || 'Trader'}! Your $60 payment is confirmed and you now have FULL access to all 8 missions.

*Join the WhatsApp community:*
${WA_CONFIG.groupLink}

*What happens next:*
1. Join the WhatsApp group above
2. Check your Telegram DM — Mission 01 is on its way
3. Download your Meme Token Scorecard from the bot (/scorecard)

Welcome to the academy. Let's get to work. 🚀

_— Meme Mastery Academy_`;

  try {
    const result = await sendWhatsAppMessage(phoneNumber, message);
    console.log('✅ WhatsApp welcome sent to', phoneNumber);
    return result;
  } catch (err) {
    console.error('WhatsApp send error:', err);
  }
}

// ── MISSION REMINDER (optional — call on a schedule) ─────────
async function sendMissionReminder({ phoneNumber, firstName, missionNum }) {
  const message =
`⚡ ${firstName}, Mission ${missionNum} is waiting for you!

Open your Telegram bot and type /mission to continue.

_Meme Mastery Academy_`;

  return sendWhatsAppMessage(phoneNumber, message);
}

// ── COMPLETION CONGRATULATIONS ────────────────────────────────
async function sendCompletionMessage({ phoneNumber, firstName }) {
  const message =
`🏆 CONGRATULATIONS ${(firstName || 'Trader').toUpperCase()}!

You have completed all 8 missions of Meme Mastery Academy.

Your certificate is ready — check your Telegram bot to download it.

Share it. You earned it. 🎓

_— Meme Mastery Academy_`;

  return sendWhatsAppMessage(phoneNumber, message);
}

module.exports = {
  sendWhatsAppAccess,
  sendMissionReminder,
  sendCompletionMessage,
};

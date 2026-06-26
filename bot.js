// ============================================================
// MEME MASTERY ACADEMY — Telegram Course Bot
// One-time payment → full access to all 8 missions
// Stack: Node.js + Telegraf v4
// Install: npm install telegraf node-cron dotenv
// ============================================================

require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const bot = new Telegraf(process.env.BOT_TOKEN);

// ── CONFIG ──────────────────────────────────────────────────
const CONFIG = {
  CHANNEL_ID: process.env.CHANNEL_ID,       // Single private course channel
  ADMIN_ID:   process.env.ADMIN_TELEGRAM_ID,
};

// ── IN-MEMORY STORE (replace with DB like Firebase in production) ─
// Structure: { telegramId: { currentMission, completedMissions: [], enrolledAt } }
const students = {};

// ── CURRICULUM — ALL 8 MISSIONS ─────────────────────────────
const MISSIONS = [
  {
    id: 1,
    title: '🔐 Mission 01 — Foundation & Wallet Setup',
    brief: `Welcome to Meme Mastery Academy! Before you touch a single token, you need your tools ready.

*What this mission covers:*
• What meme tokens are and why they move the way they do
• Setting up Phantom Wallet (Solana) step by step
• Setting up MetaMask (EVM chains)
• Funding your wallet with USDT and bridging to SOL

*Your live task:*
Set up your Phantom wallet, fund it with at least $5 in SOL, and send a screenshot of your wallet address (NOT your seed phrase) to this chat.

*Video:* [Mission 01 — Wallet Setup](https://youtu.be/REPLACE_ME)`,
    quiz: {
      question: '🧠 Quiz: What should you NEVER share with anyone?',
      options: ['Your wallet address', 'Your seed phrase / private key', 'Your Telegram username', 'Your token watchlist'],
      answer: 1,
      hint: 'Think about what gives FULL access to your wallet — not just receive access.',
    },
  },
  {
    id: 2,
    title: '📊 Mission 02 — Platform Setup & Navigation',
    brief: `Time to set up your cockpit. These three platforms are where you'll spend 90% of your research time.

*What this mission covers:*
• DexScreener: filters, bookmarks, setting price alerts
• GMGN: new pairs view, trending tokens, whale wallet tracker
• Axiom Terminal: reading the live order flow

*Your live task:*
On DexScreener, filter for Solana tokens launched in the last 30 minutes with over $10K liquidity. Screenshot the top result and post it here with your first impression.

*Video:* [Mission 02 — Platform Setup](https://youtu.be/REPLACE_ME)`,
    quiz: {
      question: '🧠 Quiz: On DexScreener, what does "Age" refer to?',
      options: ['How long the token has been trending', 'When the liquidity pool was created', 'When the dev wallet was funded', 'When the chart first turned green'],
      answer: 1,
      hint: 'It tracks the trading pair, not the token contract itself.',
    },
  },
  {
    id: 3,
    title: '🔍 Mission 03 — Token Analysis Deep Dive',
    brief: `Anyone can find a token. The skill is knowing which ones are worth touching.

*What this mission covers:*
• Reading candlestick charts at 1m and 5m timeframes
• Liquidity analysis — what's enough, what's dangerous
• Holder distribution — the top 10 wallet check
• Dev wallet flags: what a suspicious bundle looks like
• The 5 biggest rug pull red flags

*Your live task:*
Find any token on GMGN's New tab. Fill in your Meme Token Scorecard for that token and post your total score + decision (buy/pass) with reasoning.

*Video:* [Mission 03 — Token Analysis](https://youtu.be/REPLACE_ME)`,
    quiz: {
      question: '🧠 Quiz: If a token has 85% of supply in the top 3 wallets, what does that signal?',
      options: ['Very bullish — whale accumulation', 'Red flag — extreme concentration risk', 'Normal — most tokens launch this way', 'Depends on the market cap'],
      answer: 1,
      hint: 'Think about what happens when those wallets decide to sell.',
    },
  },
  {
    id: 4,
    title: '⚡ Mission 04 — Entry & Exit Strategy',
    brief: `Buying at the wrong time wipes gains. Selling at the wrong time is worse.

*What this mission covers:*
• The "first green candle" entry technique
• Dollar cost averaging into a position
• Setting take-profit targets: 2x, 5x, 10x laddering
• Hard stop-loss rules (the 30% floor)
• Why most people exit too early OR too late

*Your live task:*
Paper trade one token. Post your entry price, your TP targets, and your stop-loss level. Track and report back in 24 hours.

*Video:* [Mission 04 — Entry & Exit](https://youtu.be/REPLACE_ME)`,
    quiz: {
      question: '🧠 Quiz: What is "laddering" your take-profit?',
      options: ['Buying more tokens as price rises', 'Selling portions at multiple price targets instead of all at once', 'Setting a single exit price and waiting', 'Following whale wallets out of a position'],
      answer: 1,
      hint: 'It\'s about how you EXIT, not how you enter.',
    },
  },
  {
    id: 5,
    title: '🎯 Mission 05 — Advanced Plays',
    brief: `Once the fundamentals are locked in, these plays separate the analysts from the traders.

*What this mission covers:*
• Sniping new launches in the first 5 minutes
• Reading KOL (Key Opinion Leader) wallet moves
• The trending section play: when to follow hype
• Cross-platform confirmation: Axiom + DexScreener + GMGN together
• Reading CT (Crypto Twitter) for early signals

*Your live task:*
Find one token with at least two positive signals across two different platforms. Post your evidence.

*Video:* [Mission 05 — Advanced Plays](https://youtu.be/REPLACE_ME)`,
    quiz: {
      question: '🧠 Quiz: Why can KOL-driven pumps be dangerous to follow late?',
      options: ['KOLs are always wrong about token picks', 'The price is often already pumped by the time you see the post', 'DexScreener blocks KOL tokens', 'Solana network gets congested during KOL calls'],
      answer: 1,
      hint: 'Think about the timing between when a KOL posts and when you actually buy.',
    },
  },
  {
    id: 6,
    title: '🛡️ Mission 06 — Risk Management',
    brief: `The traders who survive long-term have one skill in common: they know how to lose small.

*What this mission covers:*
• Position sizing: the 1–5% rule per trade
• Wallet segmentation: never have everything in one hot wallet
• Recovering from a rug — the correct mental and financial reset
• The psychology of FOMO and how to counter it
• Building your personal risk rules sheet

*Your live task:*
Write out your personal 5 trading rules. Post them here. Must include max position size, stop-loss level, and max trades per day.

*Video:* [Mission 06 — Risk Management](https://youtu.be/REPLACE_ME)`,
    quiz: {
      question: '🧠 Quiz: If your trading wallet is $500, what is the MAX for one meme token?',
      options: ['$500 — go all in on a strong signal', '$250 — 50% is fine if confident', '$25 — the 5% maximum rule', '$100 — 20% to make meaningful profit'],
      answer: 2,
      hint: 'Apply the 5% rule to protect your capital across multiple trades.',
    },
  },
  {
    id: 7,
    title: '📡 Mission 07 — Alpha Sources & Community',
    brief: `Your edge is your information network. Build it deliberately.

*What this mission covers:*
• Finding high-quality Telegram alpha groups (and spotting fake ones)
• Reading Crypto Twitter without getting manipulated
• Building a personal token watchlist with alert triggers
• Creating a daily research routine (15 minutes is enough)
• When to follow the crowd vs. go against it

*Your live task:*
Find one legitimate alpha Telegram group with 500+ members and 20+ messages/day. Share the group name and explain why you trust it.

*Video:* [Mission 07 — Alpha & Community](https://youtu.be/REPLACE_ME)`,
    quiz: {
      question: '🧠 Quiz: What is the biggest red flag in a Telegram alpha group?',
      options: ['Members asking too many questions', 'Admins asking for wallet access or telling you to buy a specific token immediately', 'Group having fewer than 1,000 members', 'No pinned message in the group'],
      answer: 1,
      hint: 'Legitimate alpha groups share analysis, not orders.',
    },
  },
  {
    id: 8,
    title: '🚀 Bonus Mission — Token Launch Basics',
    brief: `You have analyzed tokens. Now understand how they are made.

*What this mission covers:*
• How Solana SPL tokens are created (no-code walkthrough)
• Pump.fun: deploying your first token step by step
• Setting initial liquidity correctly
• Marketing your launch: Telegram, Twitter, community seeding
• The 48-hour post-launch playbook

*Your live task:*
Deploy a test token on Pump.fun devnet (no real money needed). Share the token address and your experience.

*Video:* [Bonus Mission — Token Launch](https://youtu.be/REPLACE_ME)`,
    quiz: {
      question: '🧠 Quiz: What is the first thing you should do BEFORE deploying a token?',
      options: ['Buy as much as possible immediately', 'Build a community and narrative first', 'Post the contract address on Twitter', 'Set the supply to 1 billion'],
      answer: 1,
      hint: 'A token with no story and no community has no reason to pump.',
    },
  },
];

// ── HELPERS ──────────────────────────────────────────────────
function buildQuizKeyboard(mission) {
  return Markup.inlineKeyboard(
    mission.quiz.options.map((opt, i) =>
      [Markup.button.callback(`${['A','B','C','D'][i]}. ${opt}`, `quiz_${mission.id}_${i}`)]
    )
  );
}

async function sendMission(telegramId, missionNum) {
  const mission = MISSIONS.find(m => m.id === missionNum);

  if (!mission) {
    // All missions done — send certificate
    await bot.telegram.sendMessage(telegramId,
      `🏆 *COURSE COMPLETE!*\n\nYou have finished all 8 missions of Meme Mastery Academy.\n\n` +
      `[Download Your Certificate](https://yourdomain.com/certificate/${telegramId})\n\n` +
      `Share it. You earned it. 🎓`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  await bot.telegram.sendMessage(telegramId,
    `━━━━━━━━━━━━━━━━━━━━━━━\n*${mission.title}*\n━━━━━━━━━━━━━━━━━━━━━━━\n\n${mission.brief}`,
    { parse_mode: 'Markdown' }
  );

  setTimeout(async () => {
    await bot.telegram.sendMessage(telegramId,
      `*Now test your understanding:*\n\n${mission.quiz.question}`,
      { parse_mode: 'Markdown', ...buildQuizKeyboard(mission) }
    );
  }, 3000);
}

// ── PAYMENT WEBHOOK ──────────────────────────────────────────
// POST /payment-webhook
// Expected body from Paystack: { telegramId, phoneNumber, firstName, ref }
async function handlePaymentWebhook(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const payload = JSON.parse(body);
      const { telegramId, phoneNumber, firstName, ref } = payload;

      if (!telegramId) return res.writeHead(400).end('Missing telegramId');

      // Register student
      students[telegramId] = {
        currentMission: 1,
        completedMissions: [],
        phoneNumber,
        firstName,
        ref,
        enrolledAt: new Date().toISOString(),
      };

      // Generate one-time invite link to the course channel
      let inviteLink = '';
      try {
        const link = await bot.telegram.createChatInviteLink(CONFIG.CHANNEL_ID, {
          member_limit: 1,
          expire_date: Math.floor(Date.now() / 1000) + 86400,
        });
        inviteLink = link.invite_link;
      } catch (e) {
        console.error('Invite link error:', e.message);
      }

      // Welcome DM
      await bot.telegram.sendMessage(telegramId,
        `🎓 *Welcome to Meme Mastery Academy, ${firstName || 'Trader'}!*\n\n` +
        `Your payment is confirmed. You now have full access to all 8 missions.\n\n` +
        `*Join your private course channel:*\n${inviteLink}\n\n` +
        `Mission 01 drops in 60 seconds. Get ready. 🚀`,
        { parse_mode: 'Markdown' }
      );

      // Send scorecard
      setTimeout(async () => {
        await bot.telegram.sendMessage(telegramId,
          `📋 *Your Meme Token Scorecard:*\n[Download PDF](https://yourdomain.com/scorecard.pdf)\n\nSave this. Use it before buying any token.`,
          { parse_mode: 'Markdown' }
        );
      }, 10000);

      // Kick off Mission 01 after 60 seconds
      setTimeout(() => sendMission(telegramId, 1), 60000);

      // Notify admin
      await bot.telegram.sendMessage(CONFIG.ADMIN_ID,
        `✅ *New Enrollment!*\nName: ${firstName}\nTelegram ID: ${telegramId}\nPhone: ${phoneNumber}\nRef: ${ref}`,
        { parse_mode: 'Markdown' }
      );

      // Trigger WhatsApp welcome (if whatsapp.js is connected)
      try {
        const { sendWhatsAppAccess } = require('./whatsapp');
        await sendWhatsAppAccess({ phoneNumber, firstName });
      } catch (e) {
        console.log('WhatsApp module not connected:', e.message);
      }

      res.writeHead(200).end('OK');
    } catch (e) {
      console.error('Webhook error:', e);
      res.writeHead(500).end('Error');
    }
  });
}

// ── QUIZ HANDLER ─────────────────────────────────────────────
bot.action(/^quiz_(\d+)_(\d+)$/, async (ctx) => {
  const missionId  = parseInt(ctx.match[1]);
  const choiceIdx  = parseInt(ctx.match[2]);
  const telegramId = ctx.from.id;
  const student    = students[telegramId];

  if (!student) return ctx.answerCbQuery('You are not enrolled. Visit the link to join.');

  const mission = MISSIONS.find(m => m.id === missionId);
  if (!mission) return ctx.answerCbQuery('Mission not found.');

  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

  if (choiceIdx === mission.quiz.answer) {
    student.completedMissions.push(missionId);
    student.currentMission = missionId + 1;

    await ctx.reply(
      `✅ *Correct! Mission ${missionId} complete.*\n\n_Mission ${missionId + 1} is on its way..._`,
      { parse_mode: 'Markdown' }
    );

    setTimeout(() => sendMission(telegramId, student.currentMission), 30000);
  } else {
    await ctx.reply(
      `❌ *Not quite.*\n\n_Hint: ${mission.quiz.hint}_\n\nTry again:`,
      { parse_mode: 'Markdown', ...buildQuizKeyboard(mission) }
    );
  }

  ctx.answerCbQuery();
});

// ── BOT COMMANDS ─────────────────────────────────────────────
bot.command('start', async (ctx) => {
  const student = students[ctx.from.id];
  if (student) {
    return ctx.reply(
      `👋 *Welcome back!*\n\nMissions completed: ${student.completedMissions.length}/8\nCurrent mission: ${student.currentMission}\n\nType /mission to continue.`,
      { parse_mode: 'Markdown' }
    );
  }
  ctx.reply(
    `🚀 *Meme Mastery Academy*\n\nTo enroll, visit:\nhttps://yourdomain.com\n\nOne-time payment of $60 gives you full access to all 8 missions.`,
    { parse_mode: 'Markdown' }
  );
});

bot.command('mission', async (ctx) => {
  const student = students[ctx.from.id];
  if (!student) return ctx.reply('You are not enrolled yet. Visit https://yourdomain.com to join.');
  await sendMission(ctx.from.id, student.currentMission);
});

bot.command('progress', async (ctx) => {
  const student = students[ctx.from.id];
  if (!student) return ctx.reply('You are not enrolled yet.');
  const completed = student.completedMissions.length;
  const bar = '█'.repeat(completed) + '░'.repeat(8 - completed);
  ctx.reply(
    `📊 *Your Progress*\n\n[${bar}] ${completed}/8\n\nCurrent Mission: ${student.currentMission}\nEnrolled: ${student.enrolledAt?.split('T')[0]}`,
    { parse_mode: 'Markdown' }
  );
});

bot.command('scorecard', (ctx) => {
  const student = students[ctx.from.id];
  if (!student) return ctx.reply('You are not enrolled yet.');
  ctx.reply(
    `📋 [Download Your Meme Token Scorecard](https://yourdomain.com/scorecard.pdf)`,
    { parse_mode: 'Markdown' }
  );
});

// Admin: manually enroll a student
// Usage: /enroll 123456789 Mayowa 2348012345678
bot.command('enroll', async (ctx) => {
  if (ctx.from.id.toString() !== CONFIG.ADMIN_ID) return;
  const parts = ctx.message.text.split(' ');
  if (parts.length < 3) return ctx.reply('Usage: /enroll <telegramId> <firstName> [phone]');
  const [, telegramId, firstName, phoneNumber] = parts;

  students[telegramId] = {
    currentMission: 1,
    completedMissions: [],
    firstName,
    phoneNumber: phoneNumber || '',
    enrolledAt: new Date().toISOString(),
  };

  await bot.telegram.sendMessage(telegramId,
    `✅ *You have been enrolled in Meme Mastery Academy, ${firstName}!*\n\nType /mission to start Mission 01.`,
    { parse_mode: 'Markdown' }
  );
  ctx.reply(`✅ ${firstName} (${telegramId}) enrolled successfully.`);
});

// Admin: check all students
bot.command('students', async (ctx) => {
  if (ctx.from.id.toString() !== CONFIG.ADMIN_ID) return;
  const count = Object.keys(students).length;
  ctx.reply(`👥 Total students enrolled: *${count}*`, { parse_mode: 'Markdown' });
});

// ── WEBHOOK SERVER ────────────────────────────────────────────
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/payment-webhook') {
    handlePaymentWebhook(req, res);
  } else {
    res.writeHead(404).end('Not found');
  }
});

// ── LAUNCH ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Webhook server on port ${PORT}`));
bot.launch();
console.log('🤖 Meme Mastery Academy bot is live');

process.once('SIGINT',  () => { bot.stop('SIGINT');  server.close(); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); server.close(); });

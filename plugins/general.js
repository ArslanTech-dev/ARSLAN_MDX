/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎮 GENERAL.JS — ARSLAN MDX General Commands
 * ═══════════════════════════════════════════════════════════════════
 * Commands (6): ping · ping2 · uptime · alive · owner · saba
 *
 * View Channel (forwarded badge):
 *   ✅ ON  → ping · uptime · alive · owner
 *   ❌ OFF → ping2 · saba
 *
 * Channel URL links: REMOVED from all body text (no "join channels")
 * ═══════════════════════════════════════════════════════════════════
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config.js';

const __dirname     = path.dirname(fileURLToPath(import.meta.url));
const COMMUNITY_IMG = path.join(__dirname, '..', 'assets', 'community.png');
const OWNER_IMG     = path.join(__dirname, '..', 'assets', 'owner.png');

const startTime = Date.now();

// 🚀 View Channel (forwarded badge) — NO URL links in body
const getContextInfo = () => ({
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363412450457588@newsletter',
    newsletterName: 'ARSLAN MDX',
    serverMessageId: 143,
  },
});

// ═══════════════════════════════════════════════════════════════════
// 🔤 FONT HELPERS  —  Bold Serif (𝐀 𝟏) converter
// ═══════════════════════════════════════════════════════════════════
const BOLD = {
  '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗',
  'A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆','H':'𝐇','I':'𝐈','J':'𝐉',
  'K':'𝐊','L':'𝐋','M':'𝐌','N':'𝐍','O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓',
  'U':'𝐔','V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙',
  'a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠','h':'𝐡','i':'𝐢','j':'𝐣',
  'k':'𝐤','l':'𝐥','m':'𝐦','n':'𝐧','o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭',
  'u':'𝐮','v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳',
};
const bold = (s) => String(s).replace(/[0-9A-Za-z]/g, (c) => BOLD[c] || c);

// ═══════════════════════════════════════════════════════════════════
// ⏱️ TIME / LATENCY HELPERS
// ═══════════════════════════════════════════════════════════════════
const toNum = (t) =>
  t && typeof t === 'object' && typeof t.toNumber === 'function'
    ? t.toNumber()
    : Number(t);

const getLatency = (ctx) => {
  const ts = toNum(ctx.msg?.messageTimestamp);
  if (!ts) return 0;
  return Math.max(0, Date.now() - ts * 1000);
};

const shortUptime = (ms) => {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return `${d}D ${h}H ${m}M`;
  if (h > 0) return `${h}H ${m}M`;
  return `${m}M`;
};

// ═══════════════════════════════════════════════════════════════════
// 🖼️ SAFE IMAGE SENDER (fallback → text)
// ═══════════════════════════════════════════════════════════════════
async function sendImage(ctx, imagePath, caption, useChannel = true) {
  try {
    if (await fs.pathExists(imagePath)) {
      const payload = { image: fs.readFileSync(imagePath), caption };
      if (useChannel) payload.contextInfo = getContextInfo();
      return await ctx.send(payload);
    }
  } catch { /* fall through to text */ }

  const payload = { text: caption };
  if (useChannel) payload.contextInfo = getContextInfo();
  return ctx.send(payload);
}

// ═══════════════════════════════════════════════════════════════════
// 1. PING — with view channel
// ═══════════════════════════════════════════════════════════════════
export const ping = {
  name: 'ping',
  aliases: ['p'],
  async run(ctx) {
    await ctx.react('🌸');
    const latency = getLatency(ctx);
    const text =
      `*🌸 Pᴏɴɢ Rᴇᴘʟʏ!*\n` +
      `╰─➤ Lᴀᴛᴇɴᴄʏ: ${latency} ms\n` +
      `╰─➤ Sᴛɪʟʟ Rᴜɴɴɪɴɢ 🖤`;

    await ctx.send({ text, contextInfo: getContextInfo() });
  },
};

// ═══════════════════════════════════════════════════════════════════
// 2. PING2 — WITHOUT view channel
// ═══════════════════════════════════════════════════════════════════
export const ping2 = {
  name: 'ping2',
  aliases: ['p2', 'speed'],
  async run(ctx) {
    await ctx.react('⚡');

    const latency  = getLatency(ctx);
    const up       = shortUptime(Date.now() - startTime);
    const ram      = Math.round(process.memoryUsage().rss / 1024 / 1024);
    const platform = os.platform();

    const text =
      `> ⚡ *𝐀𝐑𝐒𝐋𝐀𝐍 𝐌𝐃* ⚡\n` +
      `> _𝐏𝐈𝐍𝐆𝟐_\n\n` +
      `> \`𝐒𝐩𝐞𝐞𝐝: ${bold(latency)} 𝐌𝐬\`\n` +
      `> \`𝐔𝐩𝐭𝐢𝐦𝐞: ${bold(up)}\`\n` +
      `> \`𝐌𝐞𝐦𝐨𝐫𝐲: ${bold(ram)} 𝐌𝐁\`\n` +
      `> \`𝐇𝐨𝐬𝐭: ${bold(platform)}\`\n\n` +
      `> *𝐒𝐭𝐚𝐭𝐮𝐬: 𝐎𝐧𝐥𝐢𝐧𝐞 & 𝐀𝐜𝐭𝐢𝐯𝐞* 💻\n` +
      `> 🔥 _𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐀𝐑𝐒𝐋𝐀𝐍_ 🔥`;

    await ctx.send({ text });
  },
};

// ═══════════════════════════════════════════════════════════════════
// 3. UPTIME — with view channel · 1-line
// ═══════════════════════════════════════════════════════════════════
export const uptime = {
  name: 'uptime',
  aliases: ['up'],
  async run(ctx) {
    await ctx.react('⏱️');

    const ms = Date.now() - startTime;
    const d  = Math.floor(ms / 86400000);
    const h  = Math.floor((ms % 86400000) / 3600000);
    const m  = Math.floor((ms % 3600000) / 60000);

    const timeStr = d > 0 ? `${d}𝗗 ${h}𝗛 ${m}𝗠` : `${h}𝗛 ${m}𝗠`;
    const text    = `> *𝗨𝗣: ${timeStr} | 𝗔𝗥𝗦𝗟𝗔𝗡 𝗠𝗗* 🤖`;

    await ctx.send({ text, contextInfo: getContextInfo() });
  },
};

// ═══════════════════════════════════════════════════════════════════
// 4. ALIVE — community.png + view channel
// ═══════════════════════════════════════════════════════════════════
export const alive = {
  name: 'alive',
  aliases: ['status'],
  async run(ctx) {
    await ctx.react('💚');
    const up = shortUptime(Date.now() - startTime);

    const caption =
      `> ⚡ 𝐀𝐑𝐒𝐋𝐀𝐍 𝐌𝐃 ⚡\n` +
      `> 𝘼𝙇𝙄𝙑𝙀 & 𝙊𝙉𝙇𝙄𝙉𝙀\n\n` +
      `> \`𝐍𝐚𝐦𝐞: 𝐀𝐑𝐒𝐋𝐀𝐍 𝐌𝐃\`\n` +
      `> \`𝐎𝐰𝐧𝐞𝐫: 𝐀𝐑𝐒𝐋𝐀𝐍 𝐓𝐄𝐂𝐇\`\n` +
      `> \`𝐕𝐞𝐫: 𝟒.𝟎\`\n` +
      `> \`𝐔𝐩𝐭𝐢𝐦𝐞: ${bold(up)}\`\n` +
      `> \`𝐒𝐭𝐚𝐭𝐮𝐬: 𝐎𝐧𝐥𝐢𝐧𝐞 💻\`\n\n` +
      `> 🔥 𝑷𝑶𝑾𝑬𝑹𝑬𝑫 𝑩𝒀 𝑨𝑹𝑺𝑳𝑨𝑵 🔥`;

    await sendImage(ctx, COMMUNITY_IMG, caption, true);
  },
};

// ═══════════════════════════════════════════════════════════════════
// 5. OWNER — owner.png + view channel
// ═══════════════════════════════════════════════════════════════════
export const owner = {
  name: 'owner',
  aliases: ['dev'],
  async run(ctx) {
    await ctx.react('👑');
    const num = CONFIG.OWNER_NUMBER;

    const caption =
      `> 👑 𝐀𝐑𝐒𝐋𝐀𝐍 𝐌𝐃 👑\n` +
      `> 𝘿𝙀𝙑𝙀𝙇𝙊𝙋𝙀𝙍\n\n` +
      `> \`𝐍𝐚𝐦𝐞: 𝐀𝐑𝐒𝐋𝐀𝐍 𝐓𝐄𝐂𝐇\`\n` +
      `> \`𝐍𝐮𝐦𝐛𝐞𝐫: +${num}\`\n` +
      `> \`𝐑𝐨𝐥𝐞: 𝐁𝐨𝐭 𝐀𝐫𝐜𝐡𝐢𝐭𝐞𝐜𝐭\`\n` +
      `> \`𝐂𝐡𝐚𝐭: wa.me/${num}\`\n\n` +
      `> 🔥 𝑷𝑶𝑾𝑬𝑹𝑬𝑫 𝑩𝒀 𝑨𝑹𝑺𝑳𝑨𝑵 🔥`;

    await sendImage(ctx, OWNER_IMG, caption, true);
  },
};

// ═══════════════════════════════════════════════════════════════════
// 6. SABA — no view channel
// ═══════════════════════════════════════════════════════════════════
export const saba = {
  name: 'saba',
  aliases: ['brown', 'jaan'],
  async run(ctx) {
    await ctx.react('❤️');
    const text =
      `> ❤️ *BROWNY*\n` +
      `> \n` +
      `> 🥺 \`SABA tum meri har khushi ho\`\n` +
      `> 👑 \`Tum meri Queen, meri duniya ho\`\n` +
      `> 💖 \`You are my EVERYTHING\`\n` +
      `> 💍 \`I LOVE YOU SO MUCH MERI BROWNY\`\n` +
      `> \n` +
      `> 🔥 *Always Yours*`;

    await ctx.send({ text });
  },
};
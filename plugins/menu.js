/**
 * ═══════════════════════════════════════════════════════════════════
 * 📜 MENU.JS — ARSLAN MDX Full Menu (Auto-Generated)
 * Sab plugins ko scan karke ek hi menu banata hai (logo.png ke saath).
 * Naya plugin add karo to menu mein khud aa jayega.
 * Commands (1): menu  (aliases: help, allmenu, cmds, list)
 * ═══════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config.js';
import { formatUptime } from '../utils/helper.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_DIR = __dirname;
const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.png');

const MENU_VERSION = '7.0.0 beta';
const MENU_MODE = 'public';

const getContextInfo = () => ({
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363412450457588@newsletter',
    newsletterName: 'ARSLAN MDX',
    serverMessageId: 143
  }
});

// 🔤 Small-caps font (a-z). Digits/symbols same rahenge.
const SC = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ',
  k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ',
  u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};
const sc = (str) => String(str).toLowerCase().replace(/[a-z]/g, (c) => SC[c]);

// 🗂️ Menu order (plugin file name). Jo file yahan nahi hogi wo last mein "OTHER" mein aayegi.
const FILE_ORDER = [
  'general', 'group_admin', 'group_tools', 'group_settings', 'downloader', 'utility',
  'media', 'fun', 'actions', 'romance', 'pies', 'countries', 'glitch', 'glitch2',
  'hacker', 'linux', 'linux2', 'kali', 'kali2', 'termux', 'termux2',
  'windows', 'windows2', 'errors'
];

// 🔎 Scan plugins (cached)
let cache = null;
async function scanPlugins() {
  if (cache) return cache;
  const byFile = {};
  const files = fs.readdirSync(PLUGIN_DIR).filter((f) => f.endsWith('.js') && f !== 'menu.js');
  for (const file of files) {
    try {
      const mod = await import(`file://${path.join(PLUGIN_DIR, file)}`);
      const names = [...new Set(
        [mod.default, ...Object.values(mod)]
          .filter((v) => v && v.run && v.name)
          .map((v) => v.name)
      )];
      byFile[file.replace(/\.js$/, '').replace(/^\./, '')] = names;
    } catch (err) {
      logger.error(`[MENU] Could not scan ${file}: ${err.message}`);
    }
  }
  // menu cmd khud bhi General mein dikhe
  byFile.general = ['menu', ...(byFile.general || [])];
  cache = byFile;
  return cache;
}

function buildMenu(byFile, prefix) {
  const order = [...FILE_ORDER.filter((f) => byFile[f]), ...Object.keys(byFile).filter((f) => !FILE_ORDER.includes(f))];
  let total = 0;
  const sections = [];

  for (const file of order) {
    const names = byFile[file];
    if (!names || !names.length) continue;
    total += names.length;
    const title = FILE_ORDER.includes(file) ? file.replace(/_/g, ' ') : `other ${file}`;
    const rows = names.map((n) => `║ ◈ \`${sc(n)}\``).join('\n');
    sections.push(`╔═════ ⌈ *⚡ ${sc(title)}* ⌋ ═════✧\n${rows}\n╚══════════════════════✧`);
  }

  const header = `❖ ── ✦ *${sc('arslan-mdx multi-device')}* ✦ ── ❖

╔═════ ⌈ *👑 ${sc('user info')}* ⌋ ═════✧
║ 🚀 *${sc('owner:')}* ${sc('arslan')}
║ 📂 *${sc('commands:')}* ${total}
║ ⏱️ *${sc('runtime:')}* ${sc(formatUptime(process.uptime() * 1000))}
║ ⚡ *${sc('prefix:')}* [ ${prefix} ]
║ 🔐 *${sc('mode:')}* ${sc(MENU_MODE)}
║ 📌 *${sc('version:')}* ${sc(MENU_VERSION)}
╚══════════════════════✧`;

  const list = sections.join('\n\n');
  const footer = `> 💫 _*© ${sc('powered by arslan-mdx')}*_`;
  return { header, list, footer };
}

// WhatsApp caption limit ke liye safe size
const CAPTION_LIMIT = 60000;

export const menu = {
  name: 'menu',
  aliases: ['help', 'allmenu', 'cmds', 'list'],
  async run(ctx) {
    await ctx.react('📜');
    const byFile = await scanPlugins();
    const { header, list, footer } = buildMenu(byFile, ctx.prefix || CONFIG.PREFIX || '.');
    const full = `${header}\n\n${list}\n\n${footer}`;
    const fits = full.length <= CAPTION_LIMIT;
    const caption = fits ? full : header;

    try {
      if (fs.existsSync(LOGO_PATH)) {
        await ctx.send({
          image: fs.readFileSync(LOGO_PATH),
          caption,
          mimetype: 'image/png',
          contextInfo: getContextInfo()
        });
      } else {
        await ctx.send({ text: caption, contextInfo: getContextInfo() });
      }
    } catch (err) {
      logger.error(`[MENU] Image send failed: ${err.message}`);
      await ctx.send({ text: caption, contextInfo: getContextInfo() });
    }

    // Lamba menu ho to poori vertical list logo ke baad alag message mein
    if (!fits) await ctx.send({ text: `${list}\n\n${footer}`, contextInfo: getContextInfo() });
    await ctx.react('✅');
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎮 GENERAL.JS — ARSLAN MDX General Commands
 * ═══════════════════════════════════════════════════════════════════
 * Exact Template Style | No Menu | View Channel Context
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config.js';
import { formatUptime } from '../utils/helper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.png');

const startTime = Date.now();
const prefix = CONFIG.PREFIX || '.';

// 🚀 View Channel Button Context
const getContextInfo = () => {
  return {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363412450457588@newsletter', 
      newsletterName: 'ARSLAN MDX',
      serverMessageId: 143
    }
  };
};

// ═══════════════════════════════════════════════════════════════════
// 1. PING — Advanced Template
// ═══════════════════════════════════════════════════════════════════
export const ping = {
  name: 'ping',
  aliases: ['p'],
  async run(ctx) {
    await ctx.react('⚡');
    
    const latency = Date.now() - (ctx.msg.messageTimestamp * 1000);
    
    const text = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋⚡ *𝐏𝐎𝐍𝐆 𝐑𝐄𝐏𝐋𝐘!*
┇◆┋
┇◆┋⏱️ *Latency:* ${latency} ms
┇◆┋🚀 *Status:* Still Running
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

    await ctx.send({ text, contextInfo: getContextInfo() });
  },
};

// ═══════════════════════════════════════════════════════════════════
// 2. PING2 — Aapke Diye Hue Exact Format Mein
// ═══════════════════════════════════════════════════════════════════
export const ping2 = {
  name: 'ping2',
  aliases: ['p2'],
  async run(ctx) {
    await ctx.react('🌸');
    
    const latency = Date.now() - (ctx.msg.messageTimestamp * 1000);
    
    const text = `> *🌸 Pᴏɴɢ Rᴇᴘʟʏ!*
> ╰─➤ Lᴀᴛᴇɴᴄʏ: ${latency} ms
> ╰─➤ Sᴛɪʟʟ Rᴜɴɴɪɴɢ 💗`;

    await ctx.send({ text, contextInfo: getContextInfo() });
  },
};

// ═══════════════════════════════════════════════════════════════════
// 3. ALIVE — With Logo & Template
// ═══════════════════════════════════════════════════════════════════
export const alive = {
  name: 'alive',
  aliases: ['status'],
  async run(ctx) {
    await ctx.react('💚');
    
    const uptime = formatUptime(Date.now() - startTime);
    const mem = Math.round(process.memoryUsage().rss / 1024 / 1024);
    
    const caption = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋🟢 *𝐒𝐘𝐒𝐓𝐄𝐌 𝐀𝐋𝐈𝐕𝐄*
┇◆┋
┇◆┋⏱️ *Uptime:* ${uptime}
┇◆┋⚙️ *Engine:* Baileys v7
┇◆┋💾 *Memory:* ${mem} MB
┇◆┋💻 *Platform:* ${os.platform()}
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

    try {
      if (await fs.pathExists(LOGO_PATH)) {
        await ctx.send({
          image: fs.readFileSync(LOGO_PATH),
          caption: caption,
          mimetype: 'image/png',
          contextInfo: getContextInfo()
        });
      } else {
        await ctx.send({ text: caption, contextInfo: getContextInfo() });
      }
    } catch (err) {
      await ctx.send({ text: caption, contextInfo: getContextInfo() });
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
// 4. OWNER
// ═══════════════════════════════════════════════════════════════════
export const owner = {
  name: 'owner',
  aliases: ['dev'],
  async run(ctx) {
    await ctx.react('👑');
    
    const text = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋👑 *𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑*
┇◆┋
┇◆┋👤 *Name:* Arslan Tech
┇◆┋📱 *Number:* +${CONFIG.OWNER_NUMBER}
┇◆┋💼 *Role:* Bot Architect
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

    await ctx.send({ text, contextInfo: getContextInfo() });
  },
};

// ═══════════════════════════════════════════════════════════════════
// 5. INFO
// ═══════════════════════════════════════════════════════════════════
export const info = {
  name: 'info',
  aliases: ['botinfo'],
  async run(ctx) {
    await ctx.react('🤖');
    
    const text = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋🤖 *𝐁𝐎𝐓 𝐈𝐍𝐅𝐎*
┇◆┋
┇◆┋📛 *Name:* ARSLAN MDX
┇◆┋⚙️ *Version:* ${CONFIG.BOT_VERSION}
┇◆┋🚀 *Engine:* Baileys v7
┇◆┋🛡️ *Security:* Cloud-Safe
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

    await ctx.send({ text, contextInfo: getContextInfo() });
  },
};

// ═══════════════════════════════════════════════════════════════════
// 6. UPTIME
// ═══════════════════════════════════════════════════════════════════
export const uptime = {
  name: 'uptime',
  aliases: ['up'],
  async run(ctx) {
    await ctx.react('⏱️');
    
    const ms = Date.now() - startTime;
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    const text = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋⏱️ *𝐁𝐎𝐓 𝐔𝐏𝐓𝐈𝐌𝐄*
┇◆┋
┇◆┋📅 *Days:* ${days}
┇◆┋🕐 *Hours:* ${hours}
┇◆┋⏱️ *Mins:* ${minutes}
┇◆┋⏳ *Secs:* ${seconds}
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

    await ctx.send({ text, contextInfo: getContextInfo() });
  },
};

// ═══════════════════════════════════════════════════════════════════
// 7. SABA (Special Tribute)
// ═══════════════════════════════════════════════════════════════════
export const saba = {
  name: 'saba',
  aliases: ['brown', 'jaan'],
  async run(ctx) {
    await ctx.react('💖');
    
    const text = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋💖 *𝐒𝐀𝐁𝐀*
┇◆┋
┇◆┋🧿 *Title:* Brown Hair Wali
┇◆┋✨ *Status:* My Everything
┇◆┋📝 *Note:* "Tum ho toh sab kuch hai."
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

    await ctx.send({ text, contextInfo: getContextInfo() });
  },
};
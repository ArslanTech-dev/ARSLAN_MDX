/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎮 GENERAL.JS — ARSLAN MDX General Commands
 * ═══════════════════════════════════════════════════════════════════
 * Custom Designs | Ping with Channels | 1-Line Uptime
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

// 🚀 View Channel Context
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
// 1. PING — With Channels
// ═══════════════════════════════════════════════════════════════════
export const ping = {
  name: 'ping',
  aliases: ['p'],
  async run(ctx) {
    await ctx.react('🌸');
    
    const latency = Date.now() - (ctx.msg.messageTimestamp * 1000);
    
    const text = `> *🌸 Pᴏɴɢ Rᴇᴘʟʏ!*
> ╰─➤ Lᴀᴛᴇɴᴄʏ: ${latency} ms
> ╰─➤ Sᴛɪʟʟ Rᴜɴɴɪɴɢ 💗

📢 *ᴊᴏɪɴ ᴏᴜʀ ᴄʜᴀɴɴᴇʟꜱ*
┃ ▸ https://whatsapp.com/channel/0029VbDu9GHB4hdY2mcGCH0u
┃ ▸ https://whatsapp.com/channel/0029VbDCycsAYlUGNvDTtK2F`;

    await ctx.send({ text, contextInfo: getContextInfo() });
  },
};

// ═══════════════════════════════════════════════════════════════════
// 2. PING2 — Without Channels (Exact Box Design)
// ═══════════════════════════════════════════════════════════════════
export const ping2 = {
  name: 'ping2',
  aliases: ['p2', 'speed'],
  async run(ctx) {
    await ctx.react('⚡');
    
    const latency = Date.now() - (ctx.msg.messageTimestamp * 1000);
    
    const text = `╔═════ ⌈ *⚡ ᴀʀsʟᴀɴ-ᴍᴅx ᴘɪɴɢ* ⌋ ═════✧
║ 📶 *ʀᴇsᴘᴏɴsᴇ:* ${latency} ms
║ 🧠 *sᴛᴀᴛᴜs:* ⚡ *ғᴀsᴛ & ʀᴇsᴘᴏɴsɪᴠᴇ*
║ 💫 *ᴍᴏᴅᴇ:* Active & Stable
╚══════════════════════✧`;

    await ctx.send({ text, contextInfo: getContextInfo() });
  },
};

// ═══════════════════════════════════════════════════════════════════
// 3. ALIVE — With Logo
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
// 4. UPTIME — Single Line
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

    const text = `> ⏱️ *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s`;

    await ctx.send({ text, contextInfo: getContextInfo() });
  },
};

// ═══════════════════════════════════════════════════════════════════
// 5. OWNER
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
// 6. INFO
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
// 7. SABA
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
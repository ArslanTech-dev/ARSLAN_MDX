/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎮 GENERAL.JS — ARSLAN MDX General Commands
 * ═══════════════════════════════════════════════════════════════════
 * Custom Dashboard Design (Matching the user's provided ping format).
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatUptime } from '../utils/helper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.png');

const startTime = Date.now();

// ═══════════════════════════════════════════════════════════════════
// 1. PING — Exact User Requested Format
// ═══════════════════════════════════════════════════════════════════
export const ping = {
  name: 'ping',
  aliases: ['p'],
  async run(ctx) {
    await ctx.react('⚡');
    const latency = Date.now() - (ctx.msg.messageTimestamp * 1000);
    
    const text = `*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*
*├▢ 📶 Response:* ${latency} ms
*├▢ 🧠 Status:* ⚡ *Fast & Responsive*
*├▢ 💫 Mode:* Active & Stable
*╰───────────────⊷*`;

    await ctx.reply(text);
  },
};

// ═══════════════════════════════════════════════════════════════════
// 2. PING2 — Advanced Server Diagnostics
// ═══════════════════════════════════════════════════════════════════
export const ping2 = {
  name: 'ping2',
  aliases: ['p2'],
  async run(ctx) {
    await ctx.react('⚡');
    const latency = Date.now() - (ctx.msg.messageTimestamp * 1000);
    const mem = Math.round(process.memoryUsage().rss / 1024 / 1024);

    const text = `*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*
*├▢ ⏱ Latency:* ${latency} ms
*├▢ 💻 Platform:* ${process.platform}
*├▢ ⚙️ Node.js:* ${process.version}
*├▢ 🧠 Memory:* ${mem} MB
*├▢ 🔋 Status:* 100% Operational
*╰───────────────⊷*`;

    await ctx.reply(text);
  },
};

// ═══════════════════════════════════════════════════════════════════
// 3. ALIVE — Sends Logo.png with Status
// ═══════════════════════════════════════════════════════════════════
export const alive = {
  name: 'alive',
  async run(ctx) {
    await ctx.react('💚');
    const uptimeStr = formatUptime(Date.now() - startTime);

    const caption = `*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*
*├▢ 🟢 Status:* System Alive
*├▢ 🕐 Uptime:* ${uptimeStr}
*├▢ 🚀 Speed:* Ultra Fast
*├▢ 🛡️ Security:* Active
*╰───────────────⊷*`;

    if (fs.existsSync(LOGO_PATH)) {
      await ctx.send({
        image: fs.readFileSync(LOGO_PATH),
        caption: caption
      });
    } else {
      await ctx.reply(caption);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
// 4. UPTIME — System Running Time
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

    const text = `*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*
*├▢ 📅 Days:* ${days}
*├▢ 🕐 Hours:* ${hours}
*├▢ ⏱ Minutes:* ${minutes}
*├▢ ⏳ Seconds:* ${seconds}
*╰───────────────⊷*`;

    await ctx.reply(text);
  },
};

// ═══════════════════════════════════════════════════════════════════
// 5. OWNER — Dev Contact Info (Number: 03046490245)
// ═══════════════════════════════════════════════════════════════════
export const owner = {
  name: 'owner',
  aliases: ['dev'],
  async run(ctx) {
    await ctx.react('👑');
    
    const text = `*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*
*├▢ 👨‍💻 Name:* Arslan Tech
*├▢ 📱 Number:* +92 304 6490245
*├▢ 🌐 Org:* ARSLAN MDX
*├▢ 🛠 Role:* Full-Stack Dev
*╰───────────────⊷*`;

    await ctx.reply(text);
  },
};

// ═══════════════════════════════════════════════════════════════════
// 6. HELLO — Dynamic Greeting
// ═══════════════════════════════════════════════════════════════════
export const hello = {
  name: 'hello',
  aliases: ['hi', 'salam'],
  async run(ctx) {
    await ctx.react('👋');
    
    const hour = new Date().getHours();
    let greeting = '🌙 Good Night';
    if (hour < 12) greeting = '🌅 Good Morning';
    else if (hour < 17) greeting = '☀️ Good Afternoon';
    else if (hour < 21) greeting = '🌆 Good Evening';

    const text = `*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*
*├▢ 👤 User:* @${ctx.senderNumber}
*├▢ 🕐 Time:* ${greeting}
*├▢ 💬 Message:* Hello there!
*╰───────────────⊷*`;

    await ctx.send({ text: text, mentions: [ctx.sender] });
  },
};

// ═══════════════════════════════════════════════════════════════════
// 7. BROWN — Saba Special Command
// ═══════════════════════════════════════════════════════════════════
export const brown = {
  name: 'brown',
  aliases: ['saba', 'jaan'],
  async run(ctx) {
    await ctx.react('🤎');
    
    const text = `*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*
*├▢ 💖 Name:* Saba
*├▢ 🧿 Title:* Brown Hair Wali
*├▢ ✨ Status:* My Everything
*├▢ 📝 Note:* "Tum ho toh sab kuch hai."
*╰───────────────⊷*`;

    await ctx.reply(text);
  },
};

// ═══════════════════════════════════════════════════════════════════
// 8. MY CHOICE: INFO — Bot Specifications
// ═══════════════════════════════════════════════════════════════════
export const info = {
  name: 'info',
  aliases: ['botinfo'],
  async run(ctx) {
    await ctx.react('🤖');
    
    const text = `*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*
*├▢ 🤖 Bot Name:* ARSLAN MDX
*├▢ 📦 Version:* 1.0.0 Enterprise
*├▢ ⚙️ Engine:* Baileys v7
*├▢ 🛡️ Security:* Cloud-Safe
*├▢ 🔗 Repo:* ArslanTech-dev
*╰───────────────⊷*`;

    await ctx.reply(text);
  },
};
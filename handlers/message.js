/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧩 MESSAGE.JS — Ultimate Plugin Router & Event Interceptor
 * ═══════════════════════════════════════════════════════════════════
 * Ported from SABA MD architecture. Handles plugins, Antilink, 
 * Antidelete, Welcome/Goodbye, Anti-Call, and Permissions.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config.js';
import { extractText, cleanJid, isGroup, isOwner, getSender, nowTime } from '../utils/helper.js';
import { getGroupSettings, readDb } from '../utils/database.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_DIR = path.join(__dirname, '..', 'plugins');

// 📦 PLUGIN REGISTRY
const plugins = new Map();
const aliases = new Map();
let loaded = false;

// 🎨 STYLE
const TOP = '─❍══ ⃟ ⃟ ⃟ ⃟ ══⊷❍';
const MID = '━━━━━━━━━━━━━━━━━━';
const BOT = '─❍══ ⃟ ⃟ ╟ ══⊷❍';

// 💾 MESSAGE CACHE (Anti-Delete ke liye RAM mein save)
const messageCache = new Map();

// ===============================================
// 🔄 LOAD PLUGINS
// ===============================================
export async function loadPlugins() {
  if (loaded) return;
  if (!fs.existsSync(PLUGIN_DIR)) fs.mkdirSync(PLUGIN_DIR, { recursive: true });

  const files = fs.readdirSync(PLUGIN_DIR).filter((f) => f.endsWith('.js'));
  let count = 0;

  for (const file of files) {
    try {
      const mod = await import(`file://${path.join(PLUGIN_DIR, file)}`);
      const candidates = [mod.default, ...Object.values(mod)].filter((v) => v && v.run && v.name);

      for (const p of candidates) {
        plugins.set(p.name.toLowerCase(), p);
        if (Array.isArray(p.aliases)) {
          for (const a of p.aliases) aliases.set(a.toLowerCase(), p.name.toLowerCase());
        }
        count++;
      }
    } catch (err) {
      logger.error(`Failed to load plugin (${file}):`, err.message);
    }
  }
  loaded = true;
  logger.success(`Total Plugins Loaded: ${count}`);
}

// ===============================================
// 🔗 ANTILINK HANDLER
// ===============================================
const LINK_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|chat\.whatsapp\.com\/[^\s]+|wa\.me\/[^\s]+)/gi;

async function handleAntilink(sock, msg, from, sender, text, sessionNumber) {
  try {
    const settings = await getGroupSettings(from);
    if (!settings.antilink) return false;
    if (!LINK_REGEX.test(text)) return false;
    if (isOwner(sender)) return false;

    const meta = await sock.groupMetadata(from);
    const isSenderAdmin = meta.participants.some(p => cleanJid(p.id) === cleanJid(sender) && p.admin);
    if (isSenderAdmin) return false;

    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = meta.participants.some(p => cleanJid(p.id) === cleanJid(botJid) && p.admin);
    if (!isBotAdmin) return false;

    await sock.sendMessage(from, { delete: msg.key });

    const action = settings.antilink_action || 'warn';
    const caption = `${TOP}\n   🔗 *ANTILINK DETECTED*\n${MID}\n   ⚠️ *@${cleanJid(sender)}*\n   Links are not allowed here!\n${MID}\n   ├ 👑 *Action* : ${action === 'kick' ? 'Kicked' : 'Warning'}\n   ├ 🕒 *Time*   : ${nowTime()}\n   └ 💡 *Note*   : Repeated = Kick\n${MID}\n   ⚡ *ARSLAN MDX*\n${BOT}`;

    await sock.sendMessage(from, { text: caption, mentions: [sender] });
    if (action === 'kick') await sock.groupParticipantsUpdate(from, [sender], 'remove');

    logger.warn(`[${sessionNumber}] Antilink triggered in ${from}`);
    return true;
  } catch (err) {
    logger.error(`Antilink error: ${err.message}`);
    return false;
  }
}

// ===============================================
// 🗑️ ANTIDELETE HANDLER
// ===============================================
async function handleAntidelete(sock, updates, sessionNumber) {
  try {
    const db = await readDb();
    if (!db.global_settings?.antiDelete) return; 

    for (const u of updates) {
      const isDeleted = u.update?.message === null || u.update?.messageStubType === 1 || u.update?.messageStubParameters?.[0] === 'Message deleted';
      if (!isDeleted) continue;

      const msgId = u.key?.id;
      const cached = messageCache.get(msgId);
      if (!cached) continue;

      const { msg: originalMsg, from, sender } = cached;
      if (isOwner(sender) || originalMsg.key.fromMe) continue;

      const text = extractText(originalMsg);
      const header = `${TOP}\n   🗑️ *ANTI-DELETE*\n${MID}\n   👤 *Sender* : @${cleanJid(sender)}\n   📍 *Chat*   : ${isGroup(from) ? 'Group' : 'DM'}\n   🕒 *Time*   : ${nowTime()}\n${MID}\n   📝 *Deleted Message:*`;

      if (text) {
        await sock.sendMessage(from, { text: `${header}\n   ${text}\n${MID}\n   ⚡ *ARSLAN MDX*\n${BOT}`, mentions: [sender] });
      }
      
      messageCache.delete(msgId);
    }
  } catch (err) {
    logger.error(`Antidelete error: ${err.message}`);
  }
}

// ===============================================
// 📵 ANTI-CALL HANDLER
// ===============================================
async function handleAntiCall(sock, calls, sessionNumber) {
  try {
    const db = await readDb();
    if (!db.global_settings?.antiCall) return;

    for (const call of calls) {
      if (call.status === 'offer') {
        await sock.rejectCall(call.id, call.from);
        await sock.sendMessage(call.from, { 
          text: `${TOP}\n   📵 *ANTI-CALL SYSTEM*\n${MID}\n   Calls are automatically rejected.\n   Please send a text message.\n${MID}\n   ⚡ *ARSLAN MDX*\n${BOT}` 
        });
        logger.warn(`[${sessionNumber}] Rejected call from ${call.from}`);
      }
    }
  } catch (err) {
    logger.error(`AntiCall error: ${err.message}`);
  }
}

// ===============================================
// 👋 WELCOME / GOODBYE HANDLER
// ===============================================
async function handleGroupParticipants(sock, update, sessionNumber) {
  try {
    const { id, participants, action } = update;
    const settings = await getGroupSettings(id);

    if (action === 'add' && settings.welcome) {
      const meta = await sock.groupMetadata(id);
      for (const jid of participants) {
        const caption = `${TOP}\n   👋 *WELCOME*\n${MID}\n   💚 *Hey @${cleanJid(jid)}!*\n   🎀 Welcome to *${meta.subject}*\n${MID}\n   ├ 👥 *Members* : ${meta.participants.length}\n   └ 🕒 *Time*    : ${nowTime()}\n${MID}\n   ⚡ *ARSLAN MDX*\n${BOT}`;
        await sock.sendMessage(id, { text: caption, mentions: [jid] });
      }
    }

    if (action === 'remove' && settings.goodbye) {
      const meta = await sock.groupMetadata(id);
      for (const jid of participants) {
        const caption = `${TOP}\n   💔 *GOODBYE*\n${MID}\n   🌸 *@${cleanJid(jid)}* has left\n${MID}\n   ├ 👥 *Remaining* : ${meta.participants.length}\n   └ 🕒 *Time*      : ${nowTime()}\n${MID}\n   ⚡ *ARSLAN MDX*\n${BOT}`;
        await sock.sendMessage(id, { text: caption, mentions: [jid] });
      }
    }
  } catch (err) {
    logger.error(`GroupUpdate error: ${err.message}`);
  }
}

// ===============================================
// 📩 MAIN MESSAGE HANDLER
// ===============================================
export async function handleMessage(sock, msg, sessionNumber) {
  try {
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const group = isGroup(from);
    const sender = getSender(msg);
    const text = extractText(msg);
    const owner = isOwner(sender);

    // 1. Cache message for Anti-Delete
    if (from !== 'status@broadcast') {
      messageCache.set(msg.key.id, { msg, from, sender });
      if (messageCache.size > 500) messageCache.delete(messageCache.keys().next().value);
    }

    // 2. Ignore bot's own replies unless it's a command
    if (msg.key.fromMe && (!text || !text.startsWith('.'))) return;
    if (from === 'status@broadcast') return;

    // 3. Antilink Check
    if (group && text && !owner) {
      const blocked = await handleAntilink(sock, msg, from, sender, text, sessionNumber);
      if (blocked) return;
    }

    if (!text) return;

    // 4. Command Parsing
    const prefix = '.';
    if (!text.startsWith(prefix)) return;

    const parts = text.slice(prefix.length).trim().split(/\s+/);
    const cmdRaw = parts[0].toLowerCase();
    const args = parts.slice(1);

    let plugin = plugins.get(cmdRaw);
    if (!plugin && aliases.has(cmdRaw)) plugin = plugins.get(aliases.get(cmdRaw));
    if (!plugin) return;

    // 5. Permissions
    if (plugin.ownerOnly && !owner) return sock.sendMessage(from, { text: `${TOP}\n   ❌ *ACCESS DENIED*\n${MID}\n   👑 Owner only\n${BOT}` }, { quoted: msg });
    if (plugin.groupOnly && !group) return sock.sendMessage(from, { text: `${TOP}\n   ❌ *GROUP ONLY*\n${MID}\n   👥 Use in a group\n${BOT}` }, { quoted: msg });
    if (plugin.privateOnly && group) return sock.sendMessage(from, { text: `${TOP}\n   ❌ *PRIVATE ONLY*\n${MID}\n   💬 Use in DM\n${BOT}` }, { quoted: msg });

    // 6. Context Builder
    const ctx = {
      sock, msg, from, sender, isGroup: group, isOwner: owner,
      args, text, command: plugin.name, prefix, sessionNumber,
      botNumber: sock.user?.id?.split(':')[0],
      reply: (t, opts = {}) => sock.sendMessage(from, { text: t, ...opts }, { quoted: msg }),
      react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }).catch(() => {}),
      send: (content, opts = {}) => sock.sendMessage(from, content, { quoted: msg, ...opts }),
    };

    // 7. Auto Read
    try { await sock.readMessages([msg.key]); } catch {}

    // 8. Run Plugin
    try {
      await plugin.run(ctx);
    } catch (err) {
      logger.error(`[${sessionNumber}] [${plugin.name}] ${err.message}`);
      await ctx.reply(`${TOP}\n   ❌ *COMMAND ERROR*\n${MID}\n   ${err.message.slice(0, 100)}\n${BOT}`);
    }

  } catch (err) {
    logger.error(`[${sessionNumber}] handleMessage: ${err.message}`);
  }
}

// ===============================================
// ⚙️ EVENT SETUP (Per Session)
// ===============================================
export function setupEvents(sock, sessionNumber) {
  // Group add/remove events (Welcome/Goodbye)
  sock.ev.on('group-participants.update', (u) => handleGroupParticipants(sock, u, sessionNumber));
  
  // Message delete events (Anti-Delete)
  sock.ev.on('messages.update', (u) => handleAntidelete(sock, u, sessionNumber));
  
  // Incoming calls (Anti-Call)
  sock.ev.on('call', (c) => handleAntiCall(sock, c, sessionNumber));
}
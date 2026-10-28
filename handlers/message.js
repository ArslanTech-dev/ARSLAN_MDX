/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧩 MESSAGE.JS — Ultimate Plugin Router & Event Interceptor
 * ═══════════════════════════════════════════════════════════════════
 * Includes: Public/Owner Commands, Antilink, Antidelete, Anticall, 
 * Welcome/Goodbye, and Anti-Spam Filters.
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
      logger.info(`[Plugin] Loaded ${file} (${candidates.length} cmds)`);
    } catch (err) {
      logger.error(`[Plugin] Failed to load (${file}):`, err.message);
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
    const caption = `*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ 🔗 ANTILINK DETECTED*\n*├▢* @${cleanJid(sender)}\n*├▢* Links are not allowed here!\n*├▢* Action: ${action === 'kick' ? 'Kicked' : 'Warning'}\n*╰───────────────⊷*`;

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
      const header = `*╭┈──〔 ANTI-DELETE 〕─⊷*\n*├▢ 👤 Sender:* @${cleanJid(sender)}\n*├▢ 📍 Chat:* ${isGroup(from) ? 'Group' : 'DM'}\n*├▢ 🕒 Time:* ${nowTime()}\n*├▢ 📝 Message:*`;

      if (text) {
        await sock.sendMessage(from, { text: `${header}\n${text}\n*╰───────────────⊷*`, mentions: [sender] });
        logger.info(`[${sessionNumber}] Anti-delete recovered message from ${sender}`);
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
          text: `*╭┈──〔 ANTI-CALL 〕─⊷*\n*├▢ 📵 Calls are auto-rejected.*\n*╰───────────────⊷*` 
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
        const caption = `*╭┈──〔 WELCOME 〕─⊷*\n*├▢ 💚 Hey @${cleanJid(jid)}!*\n*├▢ 🎀 Welcome to *${meta.subject}*\n*├▢ 👥 Members: ${meta.participants.length}\n*╰───────────────⊷*`;
        await sock.sendMessage(id, { text: caption, mentions: [jid] });
      }
    }

    if (action === 'remove' && settings.goodbye) {
      const meta = await sock.groupMetadata(id);
      for (const jid of participants) {
        const caption = `*╭┈──〔 GOODBYE 〕─⊷*\n*├▢ 💔 @${cleanJid(jid)} has left*\n*├▢ 👥 Remaining: ${meta.participants.length}\n*╰───────────────⊷*`;
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
    await loadPlugins();
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const group = isGroup(from);
    const sender = getSender(msg);
    const text = extractText(msg);
    const owner = isOwner(sender);

    // 🚀 SPAM FILTER: Ignore status, newsletters, and lid (temp IDs)
    if (from === 'status@broadcast' || from.endsWith('@newsletter') || from.endsWith('@lid')) {
      return;
    }

    // 1. Cache message for Anti-Delete
    messageCache.set(msg.key.id, { msg, from, sender });
    if (messageCache.size > 500) messageCache.delete(messageCache.keys().next().value);

    // 2. Owner Commands & Loop Prevention
    if (msg.key.fromMe) {
      if (!text || !text.startsWith(CONFIG.PREFIX)) {
        return; // Ignore bot's own normal replies
      }
    }

    // 3. Antilink Check
    if (group && text && !owner) {
      const blocked = await handleAntilink(sock, msg, from, sender, text, sessionNumber);
      if (blocked) return;
    }

    if (!text) return;

    // 4. Command Parsing
    const prefix = CONFIG.PREFIX;
    if (!text.startsWith(prefix)) return;

    const parts = text.slice(prefix.length).trim().split(/\s+/);
    const cmdRaw = parts[0].toLowerCase();
    const args = parts.slice(1);

    let plugin = plugins.get(cmdRaw);
    if (!plugin && aliases.has(cmdRaw)) plugin = plugins.get(aliases.get(cmdRaw));
    if (!plugin) return;

    // 5. Permissions
    if (plugin.ownerOnly && !owner) return;
    if (plugin.groupOnly && !group) return;
    if (plugin.privateOnly && group) return;

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
    logger.success(`[DEBUG] Executing "${plugin.name}"...`);
    try {
      await plugin.run(ctx);
    } catch (err) {
      logger.error(`[DEBUG] Plugin "${plugin.name}" Error:`, err.message);
    }

  } catch (err) {
    logger.error(`[${sessionNumber}] handleMessage error: ${err.message}`);
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
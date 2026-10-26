/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧩 MESSAGE.JS — Ultimate Plugin Router & Event Interceptor
 * ═══════════════════════════════════════════════════════════════════
 */
/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧩 MESSAGE.JS — Ultimate Plugin Router & Event Interceptor
 * ═══════════════════════════════════════════════════════════════════
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

const plugins = new Map();
const aliases = new Map();
let loaded = false;

const messageCache = new Map();

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
    return true;
  } catch (err) {
    return false;
  }
}

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
      const header = `🗑️ *ANTI-DELETE*\n\n👤 *Sender:* @${cleanJid(sender)}\n📝 *Message:*`;

      if (text) {
        await sock.sendMessage(from, { text: `${header}\n${text}`, mentions: [sender] });
      }
      messageCache.delete(msgId);
    }
  } catch (err) {}
}

async function handleAntiCall(sock, calls, sessionNumber) {
  try {
    const db = await readDb();
    if (!db.global_settings?.antiCall) return;

    for (const call of calls) {
      if (call.status === 'offer') {
        await sock.rejectCall(call.id, call.from);
      }
    }
  } catch (err) {}
}

async function handleGroupParticipants(sock, update, sessionNumber) {}

// ═══════════════════════════════════════════════════════════════════
// 📩 MAIN MESSAGE HANDLER (PUBLIC COMMANDS ENABLED)
// ═══════════════════════════════════════════════════════════════════
export async function handleMessage(sock, msg, sessionNumber) {
  try {
    await loadPlugins();

    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const group = isGroup(from);
    const sender = getSender(msg);
    const text = extractText(msg);
    const owner = isOwner(sender);

    if (text) {
      logger.info(`[DEBUG] Msg | fromMe: ${msg.key.fromMe} | sender: ${sender} | text: "${text}"`);
    }

    if (from !== 'status@broadcast') {
      messageCache.set(msg.key.id, { msg, from, sender });
      if (messageCache.size > 500) messageCache.delete(messageCache.keys().next().value);
    }

    if (msg.key.fromMe && (!text || !text.startsWith('.'))) return;
    if (from === 'status@broadcast') return;

    if (group && text && !owner) {
      const blocked = await handleAntilink(sock, msg, from, sender, text, sessionNumber);
      if (blocked) return;
    }

    if (!text) return;

    // Line 142 ke aas paas
const prefix = CONFIG.PREFIX; 
    if (!text.startsWith(prefix)) {
      if (!msg.key.fromMe) logger.info(`[DEBUG] No prefix. Ignoring.`);
      return;
    }

    const parts = text.slice(prefix.length).trim().split(/\s+/);
    const cmdRaw = parts[0].toLowerCase();
    const args = parts.slice(1);

    logger.info(`[DEBUG] Command: "${cmdRaw}" | Args: [${args.join(', ')}]`);

    let plugin = plugins.get(cmdRaw);
    if (!plugin && aliases.has(cmdRaw)) plugin = plugins.get(aliases.get(cmdRaw));
    
    if (!plugin) {
      logger.warn(`[DEBUG] Plugin NOT FOUND for "${cmdRaw}"`);
      return;
    }

    // 🚀 AB YEH HAR USER KE LIYE CHALEGA (Unless specifically restricted in plugin)
    if (plugin.ownerOnly && !owner) return;
    if (plugin.groupOnly && !group) return;
    if (plugin.privateOnly && group) return;

    const ctx = {
      sock, msg, from, sender, isGroup: group, isOwner: owner,
      args, text, command: plugin.name, prefix, sessionNumber,
      botNumber: sock.user?.id?.split(':')[0],
      reply: (t, opts = {}) => sock.sendMessage(from, { text: t, ...opts }, { quoted: msg }),
      react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }).catch(() => {}),
      send: (content, opts = {}) => sock.sendMessage(from, content, { quoted: msg, ...opts }),
    };

    try { await sock.readMessages([msg.key]); } catch {}

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

export function setupEvents(sock, sessionNumber) {
  sock.ev.on('group-participants.update', (u) => handleGroupParticipants(sock, u, sessionNumber));
  sock.ev.on('messages.update', (u) => handleAntidelete(sock, u, sessionNumber));
  sock.ev.on('call', (c) => handleAntiCall(sock, c, sessionNumber));
}
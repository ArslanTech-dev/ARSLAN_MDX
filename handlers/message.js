/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧩 MESSAGE.JS — Ultimate Plugin Router & Event Interceptor
 * ═══════════════════════════════════════════════════════════════════
 * Features: Antilink, Antidelete (Media+Text to Owner), Anticall, 
 * Antispam, Antibug, Welcome, Goodbye.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { CONFIG } from '../config.js';
import { extractText, cleanJid, isGroup, isOwner, getSender, nowTime } from '../utils/helper.js';
import { getGroupSettings, readDb } from '../utils/database.js';
import { isPayloadBugged } from '../utils/antibugEngine.js';
import { isSpamming } from '../utils/antispamEngine.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_DIR = path.join(__dirname, '..', 'plugins');

// 📦 PLUGIN REGISTRY
const plugins = new Map();
const aliases = new Map();
let loaded = false;

// 💾 MESSAGE CACHE (Anti-Delete ke liye)
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
    return true;
  } catch (err) {
    return false;
  }
}

// ===============================================
// 🗑️ ANTIDELETE HANDLER (Recover to OWNER DM)
// ===============================================
async function handleAntidelete(sock, updates, sessionNumber) {
  try {
    const db = await readDb();
    if (!db.global_settings?.antiDelete) return; 

    // 🚀 Get Bot's Own JID (Owner DM)
    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';

    for (const u of updates) {
      const isDeleted = u.update?.message === null || u.update?.messageStubType === 1 || u.update?.messageStubParameters?.[0] === 'Message deleted';
      if (!isDeleted) continue;

      const msgId = u.key?.id;
      const cached = messageCache.get(msgId);
      if (!cached) continue;

      const { msg: originalMsg, from, sender } = cached;
      if (isOwner(sender) || originalMsg.key.fromMe) continue;

      // 🎨 Clean & Premium Design
      const header = `> 🛡️ *ANTI-DELETE TRIGGERED*
> 
> 👤 *Sender:* @${cleanJid(sender)}
> 📍 *Chat:* ${isGroup(from) ? 'Group' : 'DM'}
> 🕒 *Time:* ${nowTime()}
> 
> © POWERED BY ARSLAN MD`;

      const m = originalMsg.message;
      let mediaType = null;
      let mediaData = null;

      // Identify Media Type
      if (m.imageMessage) { mediaType = 'image'; mediaData = m.imageMessage; }
      else if (m.videoMessage) { mediaType = 'video'; mediaData = m.videoMessage; }
      else if (m.stickerMessage) { mediaType = 'sticker'; mediaData = m.stickerMessage; }
      else if (m.audioMessage) { mediaType = 'audio'; mediaData = m.audioMessage; }
      else if (m.documentMessage) { mediaType = 'document'; mediaData = m.documentMessage; }

      // 🚀 1. IF MEDIA IS DELETED
      if (mediaType && mediaData) {
        try {
          const stream = await downloadContentFromMessage(mediaData, mediaType);
          let buffer = Buffer.from([]);
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }

          const payload = { caption: header, mentions: [sender] };

          if (mediaType === 'image') payload.image = buffer;
          else if (mediaType === 'video') payload.video = buffer;
          else if (mediaType === 'sticker') payload.sticker = buffer;
          else if (mediaType === 'audio') { payload.audio = buffer; payload.mimetype = 'audio/mp4'; }
          else if (mediaType === 'document') { 
              payload.document = buffer; 
              payload.mimetype = mediaData.mimetype; 
              payload.fileName = mediaData.fileName;
          }

          // 🚀 Send to Bot's Own Number (Owner DM)
          await sock.sendMessage(botJid, payload);
          logger.success(`[AntiDelete] Recovered ${mediaType} from ${sender} and sent to Owner DM.`);

        } catch (err) {
          logger.error(`[AntiDelete] Failed to recover media: ${err.message}`);
        }
      } 
      // 🚀 2. IF TEXT IS DELETED
      else {
        const text = extractText(originalMsg);
        if (text) {
          await sock.sendMessage(botJid, { 
            text: `${header}\n\n> 📝 *Message:* ${text}`, 
            mentions: [sender] 
          });
          logger.success(`[AntiDelete] Recovered text from ${sender} and sent to Owner DM.`);
        }
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
          text: `> 📵 *ANTI-CALL SYSTEM*
> 
> Calls are automatically rejected to prevent spam.
> Please send a text message instead.
> 
> © POWERED BY ARSLAN MD` 
        });
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
        const caption = `> 💚 *WELCOME*
> 
> Hey @${cleanJid(jid)}, welcome to *${meta.subject}*!
> 
> © POWERED BY ARSLAN MD`;
        await sock.sendMessage(id, { text: caption, mentions: [jid] });
      }
    }

    if (action === 'remove' && settings.goodbye) {
      const meta = await sock.groupMetadata(id);
      for (const jid of participants) {
        const caption = `> 💔 *GOODBYE*
> 
> @${cleanJid(jid)} has left *${meta.subject}*.
> 
> © POWERED BY ARSLAN MD`;
        await sock.sendMessage(id, { text: caption, mentions: [jid] });
      }
    }
  } catch (err) {}
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

    // 🚀 SPAM FILTER
    if (from === 'status@broadcast' || from.endsWith('@newsletter')) return;

    // 🚀 ANTI-BUG CHECK
    if (isPayloadBugged(text)) return;

    // 🚀 ANTI-SPAM CHECK (Owner is exempt)
    if (!owner) {
      const spamCheck = await isSpamming(sender);
      if (spamCheck.spam) {
        logger.warn(`[ANTI-SPAM] Blocked spam from ${sender}`);
        return; 
      }
    }

    // Cache message for Anti-Delete
    messageCache.set(msg.key.id, { msg, from, sender });
    if (messageCache.size > 1000) messageCache.delete(messageCache.keys().next().value);

    // Ignore bot's normal replies
    if (msg.key.fromMe) {
      if (!text || !text.startsWith(CONFIG.PREFIX)) return;
    }

    // Antilink Check
    if (group && text && !owner) {
      const blocked = await handleAntilink(sock, msg, from, sender, text, sessionNumber);
      if (blocked) return;
    }

    if (!text) return;

    // Command Parsing
    const prefix = CONFIG.PREFIX;
    if (!text.startsWith(prefix)) return;

    const parts = text.slice(prefix.length).trim().split(/\s+/);
    const cmdRaw = parts[0].toLowerCase();
    const args = parts.slice(1);

    let plugin = plugins.get(cmdRaw);
    if (!plugin && aliases.has(cmdRaw)) plugin = plugins.get(aliases.get(cmdRaw));
    if (!plugin) return;

    if (plugin.ownerOnly && !owner) return;
    if (plugin.groupOnly && !group) return;
    if (plugin.privateOnly && group) return;

    // Context Builder
    const ctx = {
      sock, msg, from, sender, isGroup: group, isOwner: owner,
      args, text, command: plugin.name, prefix, sessionNumber,
      botNumber: sock.user?.id?.split(':')[0],
      reply: (t, opts = {}) => sock.sendMessage(from, { text: t, ...opts }, { quoted: msg }),
      react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }).catch(() => {}),
      send: (content, opts = {}) => sock.sendMessage(from, content, { quoted: msg, ...opts }),
    };

    try { await sock.readMessages([msg.key]); } catch {}

    try {
      await plugin.run(ctx);
    } catch (err) {
      logger.error(`[${sessionNumber}] [${plugin.name}] ${err.message}`);
    }

  } catch (err) {
    logger.error(`[${sessionNumber}] handleMessage error: ${err.message}`);
  }
}

// ===============================================
// ⚙️ EVENT SETUP
// ===============================================
export function setupEvents(sock, sessionNumber) {
  sock.ev.on('group-participants.update', (u) => handleGroupParticipants(sock, u, sessionNumber));
  sock.ev.on('messages.update', (u) => handleAntidelete(sock, u, sessionNumber));
  sock.ev.on('call', (c) => handleAntiCall(sock, c, sessionNumber));
}
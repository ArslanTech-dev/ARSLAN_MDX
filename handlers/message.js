/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧩 MESSAGE.JS — Ultimate Plugin Router & Event Interceptor (v3)
 * ═══════════════════════════════════════════════════════════════════
 * NEW: No-prefix plugin support (viewonce2 etc.)
 * Fixed: antilink regex · cache TTL · media size limit
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
const noPrefixPlugins = []; // 🆕 cached list
let loaded = false;

// 💾 MESSAGE CACHE
const messageCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX = 1000;

function cacheSet(id, data) {
  messageCache.set(id, { ...data, ts: Date.now() });
  if (messageCache.size > CACHE_MAX) {
    messageCache.delete(messageCache.keys().next().value);
  }
}
function cacheGet(id) {
  const e = messageCache.get(id);
  if (!e) return null;
  if (Date.now() - e.ts > CACHE_TTL_MS) {
    messageCache.delete(id);
    return null;
  }
  return e;
}

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
      const candidates = [mod.default, ...Object.values(mod)].filter(
        (v) => v && v.run && v.name
      );

      for (const p of candidates) {
        plugins.set(p.name.toLowerCase(), p);
        if (Array.isArray(p.aliases)) {
          for (const a of p.aliases) aliases.set(a.toLowerCase(), p.name.toLowerCase());
        }
        // 🆕 Register no-prefix plugins
        if (p.noPrefix && Array.isArray(p.triggers)) {
          noPrefixPlugins.push(p);
        }
        count++;
      }
    } catch (err) {
      logger.error(`Failed to load plugin (${file}): ${err.message}`);
    }
  }
  loaded = true;
  (logger.success || logger.info)(`[PLUGINS] Total Loaded: ${count} · NoPrefix: ${noPrefixPlugins.length}`);
}

// ===============================================
// 🔗 ANTILINK
// ===============================================
const LINK_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|chat\.whatsapp\.com\/[^\s]+|wa\.me\/[^\s]+)/i;

async function handleAntilink(sock, msg, from, sender) {
  try {
    const settings = await getGroupSettings(from);
    if (!settings.antilink) return false;

    const text = extractText(msg);
    if (!text || !LINK_REGEX.test(text)) return false;
    if (isOwner(sender)) return false;
    if (msg.key.fromMe) return false;

    const meta = await sock.groupMetadata(from);
    const isSenderAdmin = meta.participants.some(
      (p) => cleanJid(p.id) === cleanJid(sender) && p.admin
    );
    if (isSenderAdmin) return false;

    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = meta.participants.some(
      (p) => cleanJid(p.id) === cleanJid(botJid) && p.admin
    );
    if (!isBotAdmin) return false;

    await sock.sendMessage(from, { delete: msg.key });
    return true;
  } catch (err) {
    logger.error(`[ANTILINK] ${err.message}`);
    return false;
  }
}

// ===============================================
// 🗑️ ANTIDELETE
// ===============================================
const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

async function handleAntidelete(sock, updates, sessionNumber) {
  try {
    const db = await readDb();
    if (!db.global_settings?.antiDelete) return;

    const botJid = sock.user?.id
      ? sock.user.id.split(':')[0] + '@s.whatsapp.net'
      : null;
    if (!botJid) return;

    for (const u of updates) {
      const isDeleted =
        u.update?.message === null ||
        u.update?.message === undefined ||
        u.update?.messageStubType === 1 ||
        u.update?.messageStubParameters?.[0] === 'Message deleted';
      if (!isDeleted) continue;

      const msgId = u.key?.id;
      const cached = cacheGet(msgId);
      if (!cached) continue;

      const { msg: originalMsg, from, sender } = cached;
      if (isOwner(sender) || originalMsg.key.fromMe) {
        messageCache.delete(msgId);
        continue;
      }

      const header =
        `> 🛡️ *ANTI-DELETE TRIGGERED*\n` +
        `> \n` +
        `> 👤 *Sender:* @${cleanJid(sender)}\n` +
        `> 📍 *Chat:* ${isGroup(from) ? 'Group' : 'DM'}\n` +
        `> 🕒 *Time:* ${nowTime()}\n` +
        `> \n` +
        `> © POWERED BY ARSLAN MD`;

      const m = originalMsg.message;
      let mediaType = null;
      let mediaData = null;

      if (m.imageMessage)         { mediaType = 'image';    mediaData = m.imageMessage; }
      else if (m.videoMessage)    { mediaType = 'video';    mediaData = m.videoMessage; }
      else if (m.stickerMessage)  { mediaType = 'sticker';  mediaData = m.stickerMessage; }
      else if (m.audioMessage)    { mediaType = 'audio';    mediaData = m.audioMessage; }
      else if (m.documentMessage) { mediaType = 'document'; mediaData = m.documentMessage; }

      if (mediaType && mediaData) {
        const fileSize = Number(mediaData.fileLength || 0);
        if (fileSize > MAX_MEDIA_BYTES) {
          await sock.sendMessage(botJid, {
            text: `${header}\n\n> ⚠️ Media too large (${Math.round(fileSize / 1024 / 1024)} MB) — skipped.`,
            mentions: [sender],
          });
          messageCache.delete(msgId);
          continue;
        }

        try {
          const stream = await downloadContentFromMessage(mediaData, mediaType);
          const chunks = [];
          for await (const chunk of stream) chunks.push(chunk);
          const buffer = Buffer.concat(chunks);

          const payload = { caption: header, mentions: [sender] };
          if (mediaType === 'image')         payload.image = buffer;
          else if (mediaType === 'video')    payload.video = buffer;
          else if (mediaType === 'sticker')  payload.sticker = buffer;
          else if (mediaType === 'audio')  { payload.audio = buffer; payload.mimetype = 'audio/mp4'; }
          else if (mediaType === 'document') {
            payload.document = buffer;
            payload.mimetype = mediaData.mimetype;
            payload.fileName = mediaData.fileName;
          }

          await sock.sendMessage(botJid, payload);
          logger.info(`[AntiDelete] Recovered ${mediaType} from ${sender}`);
        } catch (err) {
          logger.error(`[AntiDelete] Media failed: ${err.message}`);
        }
      } else {
        const text = extractText(originalMsg);
        if (text) {
          await sock.sendMessage(botJid, {
            text: `${header}\n\n> 📝 *Message:* ${text}`,
            mentions: [sender],
          });
          logger.info(`[AntiDelete] Recovered text from ${sender}`);
        }
      }

      messageCache.delete(msgId);
    }
  } catch (err) {
    logger.error(`[AntiDelete] error: ${err.message}`);
  }
}

// ===============================================
// 📵 ANTI-CALL
// ===============================================
async function handleAntiCall(sock, calls) {
  try {
    const db = await readDb();
    if (!db.global_settings?.antiCall) return;

    for (const call of calls) {
      if (call.status === 'offer') {
        await sock.rejectCall(call.id, call.from);
        await sock.sendMessage(call.from, {
          text:
            `> 📵 *ANTI-CALL SYSTEM*\n` +
            `> \n` +
            `> Calls are automatically rejected to prevent spam.\n` +
            `> Please send a text message instead.\n` +
            `> \n` +
            `> © POWERED BY ARSLAN MD`,
        });
      }
    }
  } catch (err) {
    logger.error(`[AntiCall] ${err.message}`);
  }
}

// ===============================================
// 👋 WELCOME / GOODBYE
// ===============================================
async function handleGroupParticipants(sock, update) {
  try {
    const { id, participants, action } = update;
    const settings = await getGroupSettings(id);

    if (action === 'add' && settings.welcome) {
      const meta = await sock.groupMetadata(id);
      for (const jid of participants) {
        await sock.sendMessage(id, {
          text:
            `> 💚 *WELCOME*\n` +
            `> \n` +
            `> Hey @${cleanJid(jid)}, welcome to *${meta.subject}*!\n` +
            `> \n` +
            `> © POWERED BY ARSLAN MD`,
          mentions: [jid],
        });
      }
    }

    if (action === 'remove' && settings.goodbye) {
      const meta = await sock.groupMetadata(id);
      for (const jid of participants) {
        await sock.sendMessage(id, {
          text:
            `> 💔 *GOODBYE*\n` +
            `> \n` +
            `> @${cleanJid(jid)} has left *${meta.subject}*.\n` +
            `> \n` +
            `> © POWERED BY ARSLAN MD`,
          mentions: [jid],
        });
      }
    }
  } catch (err) {
    logger.error(`[GroupUpdate] ${err.message}`);
  }
}

// ===============================================
// 🆕 NO-PREFIX PLUGIN DISPATCHER
// ===============================================
const normalizeTrigger = (s) =>
  String(s || '')
    .normalize('NFC')
    .replace(/[\uFE0E\uFE0F]/g, '')
    .trim()
    .toLowerCase();

function findNoPrefixPlugin(text) {
  if (!text || !noPrefixPlugins.length) return null;
  const norm = normalizeTrigger(text);
  for (const p of noPrefixPlugins) {
    if (p.triggers.some((t) => normalizeTrigger(t) === norm)) return p;
  }
  return null;
}

function hasReply(msg) {
  const m = msg?.message || {};
  const info =
    m.extendedTextMessage?.contextInfo ||
    m.imageMessage?.contextInfo ||
    m.videoMessage?.contextInfo ||
    m.audioMessage?.contextInfo ||
    m.documentMessage?.contextInfo ||
    m.stickerMessage?.contextInfo;
  return !!info?.quotedMessage;
}

// ===============================================
// 📩 MAIN MESSAGE HANDLER
// ===============================================
export async function handleMessage(sock, msg, sessionNumber) {
  try {
    await loadPlugins();
    if (!msg.message) return;

    const from   = msg.key.remoteJid;
    const group  = isGroup(from);
    const sender = getSender(msg);
    const text   = extractText(msg);
    const owner  = isOwner(sender);

    // Skip status / newsletter
    if (from === 'status@broadcast' || from.endsWith('@newsletter')) return;

    // Anti-bug
    if (isPayloadBugged(text)) return;

    // Anti-spam
    if (!owner) {
      const spamCheck = await isSpamming(sender);
      if (spamCheck.spam) {
        logger.warn(`[ANTI-SPAM] Blocked ${sender}`);
        return;
      }
    }

    // Cache for anti-delete
    try {
      const db = await readDb();
      if (db.global_settings?.antiDelete && !msg.key.fromMe) {
        cacheSet(msg.key.id, { msg, from, sender });
      }
    } catch {}

    // Bot's own non-command messages
    if (msg.key.fromMe) {
      if (!text || !text.startsWith(CONFIG.PREFIX)) return;
    }

    // Anti-link
    if (group && !owner && !msg.key.fromMe) {
      const blocked = await handleAntilink(sock, msg, from, sender);
      if (blocked) return;
    }

    if (!text) return;

    // ─────────────────────────────────────────────
    // 🆕 NO-PREFIX PLUGIN CHECK (before prefix parsing)
    // ─────────────────────────────────────────────
    const noPrefixPlugin = findNoPrefixPlugin(text);
    if (noPrefixPlugin) {
      if (noPrefixPlugin.requiresReply && !hasReply(msg)) {
        // skip — needs a reply
      } else {
        const ctx = {
          sock, msg, from, sender,
          isGroup: group, isOwner: owner,
          args: [], text, command: noPrefixPlugin.name,
          prefix: CONFIG.PREFIX, sessionNumber,
          botNumber: sock.user?.id?.split(':')[0],
          reply: (t, opts = {}) => sock.sendMessage(from, { text: t, ...opts }, { quoted: msg }),
          react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }).catch(() => {}),
          send: (content, opts = {}) => sock.sendMessage(from, content, { quoted: msg, ...opts }),
        };
        try { await sock.readMessages([msg.key]); } catch {}
        try {
          await noPrefixPlugin.run(ctx);
        } catch (err) {
          logger.error(`[${sessionNumber}] [${noPrefixPlugin.name}] ${err.message}`);
        }
        return; // handled
      }
    }

    // ─────────────────────────────────────────────
    // PREFIX COMMANDS
    // ─────────────────────────────────────────────
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

    const ctx = {
      sock, msg, from, sender,
      isGroup: group, isOwner: owner,
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
    logger.error(`[${sessionNumber}] handleMessage: ${err.message}`);
  }
}

// ===============================================
// ⚙️ EVENT SETUP
// ===============================================
export function setupEvents(sock, sessionNumber) {
  sock.ev.on('group-participants.update', (u) => handleGroupParticipants(sock, u));
  sock.ev.on('messages.update', (u) => handleAntidelete(sock, u, sessionNumber));
  sock.ev.on('call', (c) => handleAntiCall(sock, c));
}
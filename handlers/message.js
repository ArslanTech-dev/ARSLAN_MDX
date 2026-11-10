/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧩 MESSAGE.JS — ARSLAN MDX · Ultimate Router (v4 Robust + Debug)
 * ═══════════════════════════════════════════════════════════════════
 * ✅ No-prefix plugin support (viewonce2 etc.)
 * ✅ Robust anti-delete (multi-variant detection, retry, size cap)
 * ✅ Robust anti-call (status filter, dedupe, owner notify)
 * ✅ Debug logging at every step
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

// ═══════════════════════════════════════════════════════════════════
// 📦 REGISTRY
// ═══════════════════════════════════════════════════════════════════
const plugins = new Map();
const aliases = new Map();
const noPrefixPlugins = [];
let loaded = false;

// ═══════════════════════════════════════════════════════════════════
// 💾 MESSAGE CACHE (anti-delete)
// ═══════════════════════════════════════════════════════════════════
const messageCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX = 2000;

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

// ═══════════════════════════════════════════════════════════════════
// 🔄 LOAD PLUGINS
// ═══════════════════════════════════════════════════════════════════
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
  (logger.success || logger.info)(
    `[PLUGINS] Total: ${count} · NoPrefix: ${noPrefixPlugins.length}`
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🔗 ANTILINK
// ═══════════════════════════════════════════════════════════════════
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
    logger.info(`[ANTILINK] 🗑 Deleted link from ${cleanJid(sender)}`);
    return true;
  } catch (err) {
    logger.error(`[ANTILINK] ${err.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🗑️ ANTIDELETE — ROBUST VERSION
// ═══════════════════════════════════════════════════════════════════
const MAX_MEDIA_BYTES = 50 * 1024 * 1024;
const STUB_DELETE_TYPES = [0, 1, 2, 3]; // REVOKE variants

function isDeleteUpdate(update) {
  if (!update) return false;
  if (update.message === null) return true;
  if (update.message === undefined) return true;
  if (STUB_DELETE_TYPES.includes(update.messageStubType)) return true;
  const params = update.messageStubParameters;
  if (Array.isArray(params) && params.some(
    (p) => typeof p === 'string' && /delete|remove|revoke/i.test(p)
  )) return true;
  return false;
}

function getMediaFromMessage(m) {
  if (!m) return null;
  if (m.imageMessage)         return { type: 'image',    data: m.imageMessage };
  if (m.videoMessage)         return { type: 'video',    data: m.videoMessage };
  if (m.stickerMessage)       return { type: 'sticker',  data: m.stickerMessage };
  if (m.audioMessage)         return { type: 'audio',    data: m.audioMessage };
  if (m.documentMessage)      return { type: 'document', data: m.documentMessage };

  // Unwrap view-once / ephemeral
  const inner =
    m.viewOnceMessage?.message ||
    m.viewOnceMessageV2?.message ||
    m.viewOnceMessageV2Extension?.message ||
    m.ephemeralMessage?.message;
  if (inner) return getMediaFromMessage(inner);

  return null;
}

async function tryDownload(media, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const stream = await downloadContentFromMessage(media.data, media.type);
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      if (buffer.length) return buffer;
      throw new Error('Empty buffer');
    } catch (err) {
      if (attempt === retries) throw err;
      logger.warn(`[AntiDelete] Download retry ${attempt + 1}/${retries}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

async function handleAntidelete(sock, updates, sessionNumber) {
  try {
    const db = await readDb();
    if (!db.global_settings?.antiDelete) return;

    const botJid = sock.user?.id
      ? sock.user.id.split(':')[0] + '@s.whatsapp.net'
      : null;
    if (!botJid) {
      logger.warn(`[AntiDelete] No botJid — skip`);
      return;
    }

    for (const u of updates) {
      if (!u?.key?.id) continue;
      if (!isDeleteUpdate(u.update)) continue;

      const msgId = u.key.id;
      const cached = cacheGet(msgId);
      if (!cached) {
        logger.info(`[AntiDelete] ❌ Not in cache: ${msgId}`);
        continue;
      }

      const { msg: originalMsg, from, sender } = cached;
      if (isOwner(sender) || originalMsg.key.fromMe) {
        messageCache.delete(msgId);
        continue;
      }

      logger.info(`[AntiDelete] ▶ Processing ${msgId} from ${cleanJid(sender)}`);

      const header =
        `> 🛡️ *ANTI-DELETE TRIGGERED*\n` +
        `> ────────────────\n` +
        `> 👤 \`Sender: @${cleanJid(sender)}\`\n` +
        `> 📍 \`Chat  : ${isGroup(from) ? 'Group' : 'DM'}\`\n` +
        `> 🕒 \`Time  : ${nowTime()}\`\n` +
        `> ────────────────\n` +
        `> 💫 _POWERED BY ARSLAN MD_`;

      const media = getMediaFromMessage(originalMsg.message);

      // ── MEDIA DELETED ──
      if (media) {
        const fileSize = Number(media.data.fileLength || 0);
        if (fileSize > MAX_MEDIA_BYTES) {
          await sock.sendMessage(botJid, {
            text: `${header}\n\n> ⚠️ Media too large (${Math.round(fileSize / 1024 / 1024)} MB) — skipped.`,
            mentions: [sender],
          });
          messageCache.delete(msgId);
          continue;
        }

        try {
          const buffer = await tryDownload(media, 2);

          const payload = { caption: header, mentions: [sender] };
          if (media.type === 'image')         payload.image = buffer;
          else if (media.type === 'video')    payload.video = buffer;
          else if (media.type === 'sticker')  payload.sticker = buffer;
          else if (media.type === 'audio')  { payload.audio = buffer; payload.mimetype = 'audio/mp4'; }
          else if (media.type === 'document') {
            payload.document = buffer;
            payload.mimetype = media.data.mimetype;
            payload.fileName = media.data.fileName || 'file';
          }

          await sock.sendMessage(botJid, payload);
          logger.info(`[AntiDelete] ✅ Recovered ${media.type} (${buffer.length} bytes)`);
        } catch (err) {
          // Media download failed → send text with error note
          logger.error(`[AntiDelete] Media download failed: ${err.message}`);
          const text = extractText(originalMsg);
          await sock.sendMessage(botJid, {
            text: `${header}\n\n> ⚠️ *${media.type.toUpperCase()} expired/undownloadable*\n` +
                  (text ? `> 📝 *Text:* ${text}` : ''),
            mentions: [sender],
          });
        }
      }
      // ── TEXT DELETED ──
      else {
        const text = extractText(originalMsg);
        if (text) {
          await sock.sendMessage(botJid, {
            text: `${header}\n\n> 📝 *Message:*\n> ${text}`,
            mentions: [sender],
          });
          logger.info(`[AntiDelete] ✅ Recovered text from ${cleanJid(sender)}`);
        }
      }

      messageCache.delete(msgId);
    }
  } catch (err) {
    logger.error(`[AntiDelete] error: ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📵 ANTICALL — ROBUST VERSION
// ═══════════════════════════════════════════════════════════════════
const callCooldown = new Map(); // `${from}_${id}` -> timestamp
const CALL_COOLDOWN_MS = 60 * 1000;

async function handleAntiCall(sock, calls) {
  try {
    const db = await readDb();
    const enabled = !!db.global_settings?.antiCall;

    for (const call of calls) {
      if (!call || !call.from || !call.id) continue;

      logger.info(
        `[AntiCall] event from=${cleanJid(call.from)} status=${call.status} id=${call.id}`
      );

      // Only handle incoming ringing calls
      if (call.status !== 'offer') continue;

      if (!enabled) {
        logger.info(`[AntiCall] ⏭ DISABLED — ignoring call from ${cleanJid(call.from)}`);
        continue;
      }

      // Dedupe — WhatsApp may fire same call multiple times
      const key = `${call.from}_${call.id}`;
      const now = Date.now();
      if (now - (callCooldown.get(key) || 0) < CALL_COOLDOWN_MS) {
        logger.info(`[AntiCall] ⏭ Duplicate — already rejected`);
        continue;
      }
      callCooldown.set(key, now);
      if (callCooldown.size > 200) {
        callCooldown.delete(callCooldown.keys().next().value);
      }

      // 1. Reject
      try {
        await sock.rejectCall(call.id, call.from);
        logger.info(`[AntiCall] ✅ Rejected from ${cleanJid(call.from)}`);
      } catch (err) {
        logger.error(`[AntiCall] Reject failed: ${err.message}`);
      }

      // 2. Auto-reply to caller
      try {
        await sock.sendMessage(call.from, {
          text:
            `> 📵 *ANTI-CALL SYSTEM*\n` +
            `> ────────────────\n` +
            `> Calls are automatically *rejected* to prevent spam.\n` +
            `> Please send a text message instead.\n` +
            `> ────────────────\n` +
            `> 💫 _POWERED BY ARSLAN MD_`,
        });
      } catch (err) {
        logger.warn(`[AntiCall] Auto-reply failed: ${err.message}`);
      }

      // 3. Notify owner (bot's own DM)
      try {
        const botJid = sock.user?.id
          ? sock.user.id.split(':')[0] + '@s.whatsapp.net'
          : null;
        if (botJid && botJid !== call.from) {
          await sock.sendMessage(botJid, {
            text:
              `> 📵 *CALL REJECTED*\n` +
              `> ────────────────\n` +
              `> 👤 \`From: ${cleanJid(call.from)}\`\n` +
              `> 🕒 \`Time: ${nowTime()}\`\n` +
              `> ────────────────\n` +
              `> 💫 _POWERED BY ARSLAN MD_`,
          });
        }
      } catch {}
    }
  } catch (err) {
    logger.error(`[AntiCall] ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 👋 WELCOME / GOODBYE
// ═══════════════════════════════════════════════════════════════════
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
            `> ────────────────\n` +
            `> Hey @${cleanJid(jid)}, welcome to *${meta.subject}*!\n` +
            `> ────────────────\n` +
            `> 💫 _POWERED BY ARSLAN MD_`,
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
            `> ────────────────\n` +
            `> @${cleanJid(jid)} has left *${meta.subject}*.\n` +
            `> ────────────────\n` +
            `> 💫 _POWERED BY ARSLAN MD_`,
          mentions: [jid],
        });
      }
    }
  } catch (err) {
    logger.error(`[GroupUpdate] ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🔍 NO-PREFIX HELPERS
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 📩 MAIN MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════════
export async function handleMessage(sock, msg, sessionNumber) {
  try {
    await loadPlugins();
    if (!msg.message) return;

    const from   = msg.key.remoteJid;
    const group  = isGroup(from);
    const sender = getSender(msg);
    const text   = extractText(msg);
    const owner  = isOwner(sender);

    // 🔍 DEBUG
    logger.info(`[MSG-IN] from=${from} sender=${cleanJid(sender)} text="${text?.slice(0, 40) || ''}"`);

    if (from === 'status@broadcast' || from.endsWith('@newsletter')) return;
    if (isPayloadBugged(text)) return;

    if (!owner) {
      const spamCheck = await isSpamming(sender);
      if (spamCheck.spam) {
        logger.warn(`[ANTI-SPAM] Blocked ${cleanJid(sender)}`);
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

    // ═══════════════════════════════════════════════════════════
    // 🆕 NO-PREFIX PLUGIN (before prefix parsing)
    // ═══════════════════════════════════════════════════════════
    const noPrefixPlugin = findNoPrefixPlugin(text);
    logger.info(`[NO-PREFIX] text="${text}" → ${noPrefixPlugin ? noPrefixPlugin.name : 'no match'}`);

    if (noPrefixPlugin) {
      const hasQ = hasReply(msg);
      logger.info(`[NO-PREFIX] plugin=${noPrefixPlugin.name} hasReply=${hasQ}`);

      if (noPrefixPlugin.requiresReply && !hasQ) {
        logger.info(`[NO-PREFIX] ⚠ Skipped — reply required`);
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
          logger.info(`[NO-PREFIX] ▶ Running ${noPrefixPlugin.name}...`);
          await noPrefixPlugin.run(ctx);
        } catch (err) {
          logger.error(`[${sessionNumber}] [${noPrefixPlugin.name}] ${err.message}`);
        }
        return;
      }
    }

    // ═══════════════════════════════════════════════════════════
    // PREFIX COMMANDS
    // ═══════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// ⚙️ EVENT SETUP
// ═══════════════════════════════════════════════════════════════════
export function setupEvents(sock, sessionNumber) {
  sock.ev.on('group-participants.update', (u) => handleGroupParticipants(sock, u));
  sock.ev.on('messages.update', (u) => handleAntidelete(sock, u, sessionNumber));
  sock.ev.on('call', (c) => handleAntiCall(sock, c));
}
/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧩 MESSAGE.JS — ARSLAN MDX (Ultimate Strong Version v5)
 * ═══════════════════════════════════════════════════════════════════
 * ✅ Perfect Self-JID Recognition (Fixes Kick/Promote/Welcome)
 * ✅ Premium Design for AntiDelete & AntiCall
 * ✅ Strong AntiLink (With Admin checks)
 * ✅ Proper Mentions & Welcome/Goodbye
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

// ─── REGISTRY ───
const plugins = new Map();
const aliases = new Map();
const noPrefixPlugins = [];
let loaded = false;

// ─── MESSAGE CACHE (Anti-Delete) ───
const messageCache = new Map();

// ===============================================
// 🛠️ HELPER: Get Bot's Exact JID (Fixes Admin Recognition)
// ===============================================
function getBotJid(sock) {
  if (!sock.user?.id) return null;
  const cleanId = sock.user.id.split(':')[0].split('@')[0];
  return `${cleanId}@s.whatsapp.net`;
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
      const candidates = [mod.default, ...Object.values(mod)].filter((v) => v && v.run && v.name);

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
  logger.info(`[PLUGINS] Loaded: ${count} | NoPrefix: ${noPrefixPlugins.length}`);
}

// ===============================================
// 🔗 ANTILINK (Strong)
// ===============================================
const LINK_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|chat\.whatsapp\.com\/[^\s]+|wa\.me\/[^\s]+)/i;

async function handleAntilink(sock, msg, from, sender) {
  try {
    const settings = await getGroupSettings(from);
    if (!settings.antilink) return false;
    if (!LINK_REGEX.test(extractText(msg))) return false;
    if (isOwner(sender) || msg.key.fromMe) return false;

    const meta = await sock.groupMetadata(from);
    const isSenderAdmin = meta.participants.some((p) => cleanJid(p.id) === cleanJid(sender) && p.admin);
    if (isSenderAdmin) return false;

    const botJid = getBotJid(sock);
    const isBotAdmin = meta.participants.some((p) => cleanJid(p.id) === cleanJid(botJid) && p.admin);
    if (!isBotAdmin) return false;

    await sock.sendMessage(from, { delete: msg.key });
    logger.info(`[ANTILINK] Deleted link from ${cleanJid(sender)}`);
    return true;
  } catch { return false; }
}

// ===============================================
// 🗑️ ANTI-DELETE (Premium Design & Strong)
// ===============================================
async function handleAntidelete(sock, updates) {
  try {
    const db = await readDb();
    if (!db.global_settings?.antiDelete) return;

    const botJid = getBotJid(sock);
    if (!botJid) return;

    for (const u of updates) {
      // Detect all types of deletions
      const isDeleted = u.update?.message === null || u.update?.messageStubType === 1 || u.update?.messageStubParameters?.[0] === 'Message deleted';
      if (!isDeleted) continue;

      const cached = messageCache.get(u.key?.id);
      if (!cached) continue;

      const { msg: originalMsg, from, sender } = cached;
      if (isOwner(sender) || originalMsg.key.fromMe) {
        messageCache.delete(u.key.id);
        continue;
      }

      // 🎨 PREMIUM DESIGN
      const header = 
        `> 🛡️ *ANTI-DELETE TRIGGERED*\n` +
        `> ────────────────\n` +
        `> 👤 \`Sender : @${cleanJid(sender)}\`\n` +
        `> 📍 \`Chat   : ${isGroup(from) ? 'Group' : 'DM'}\`\n` +
        `> 🕒 \`Time   : ${nowTime()}\`\n` +
        `> ────────────────\n` +
        `> 💫 _POWERED BY ARSLAN MD_ 💫`;

      const m = originalMsg.message;
      let mediaType = null, mediaData = null;

      if (m.imageMessage) { mediaType = 'image'; mediaData = m.imageMessage; }
      else if (m.videoMessage) { mediaType = 'video'; mediaData = m.videoMessage; }
      else if (m.audioMessage) { mediaType = 'audio'; mediaData = m.audioMessage; }
      else if (m.stickerMessage) { mediaType = 'sticker'; mediaData = m.stickerMessage; }

      try {
        if (mediaType && mediaData) {
          const stream = await downloadContentFromMessage(mediaData, mediaType);
          const chunks = [];
          for await (const c of stream) chunks.push(c);
          const buffer = Buffer.concat(chunks);

          const payload = { caption: header, mentions: [sender] };
          if (mediaType === 'image') payload.image = buffer;
          else if (mediaType === 'video') payload.video = buffer;
          else if (mediaType === 'audio') { payload.audio = buffer; payload.mimetype = 'audio/mp4'; }
          else if (mediaType === 'sticker') payload.sticker = buffer;

          await sock.sendMessage(botJid, payload);
        } else {
          const text = extractText(originalMsg);
          if (text) await sock.sendMessage(botJid, { text: `${header}\n\n> 📝 *Message:* ${text}`, mentions: [sender] });
        }
      } catch (e) {
        await sock.sendMessage(botJid, { text: `${header}\n\n> ⚠️ Media expired/undownloadable.` });
      }
      messageCache.delete(u.key.id);
    }
  } catch (err) {
    logger.error(`[AntiDelete] ${err.message}`);
  }
}

// ===============================================
// 📵 ANTI-CALL (Premium Design)
// ===============================================
async function handleAntiCall(sock, calls) {
  try {
    const db = await readDb();
    if (!db.global_settings?.antiCall) return;

    for (const call of calls) {
      if (call.status === 'offer') {
        await sock.rejectCall(call.id, call.from);
        
        // 🎨 PREMIUM DESIGN
        const callMsg = 
          `> 📵 *ANTI-CALL SYSTEM*\n` +
          `> ────────────────\n` +
          `> ⛔ \`Status : Call Auto-Rejected\`\n` +
          `> 💬 \`Reason : Security Protocol\`\n` +
          `> ────────────────\n` +
          `> 👉 _Please send a text message instead._\n\n` +
          `> 💫 _POWERED BY ARSLAN MD_ 💫`;
          
        await sock.sendMessage(call.from, { text: callMsg });
      }
    }
  } catch (err) {
    logger.error(`[AntiCall] ${err.message}`);
  }
}

// ===============================================
// 👋 WELCOME / GOODBYE (Fixed & Strong)
// ===============================================
async function handleGroupParticipants(sock, update) {
  try {
    const { id, participants, action } = update;
    const settings = await getGroupSettings(id);
    const meta = await sock.groupMetadata(id);

    // 🟢 WELCOME (JOIN)
    if (action === 'add' && settings.welcome) {
      for (const jid of participants) {
        const userNum = jid.split('@')[0];
        const caption = 
          `> 💚 *WELCOME TO THE GROUP*\n` +
          `> ────────────────\n` +
          `> 👋 \`Hey @${userNum},\`\n` +
          `> Welcome to *${meta.subject}*!\n` +
          `> 🎉 We are glad to have you here.\n` +
          `> ────────────────\n` +
          `> 💫 _POWERED BY ARSLAN MD_ 💫`;
          
        await sock.sendMessage(id, { text: caption, mentions: [jid] });
      }
    }

    // 🔴 GOODBYE (LEAVE/KICK)
    if (action === 'remove' && settings.goodbye) {
      for (const jid of participants) {
        const userNum = jid.split('@')[0];
        const caption = 
          `> 💔 *GOODBYE*\n` +
          `> ────────────────\n` +
          `> 👋 \`@${userNum}\` has left the group.\n` +
          `> 🥀 We will miss you in *${meta.subject}*.\n` +
          `> ────────────────\n` +
          `> 💫 _POWERED BY ARSLAN MD_ 💫`;

        await sock.sendMessage(id, { text: caption, mentions: [jid] });
      }
    }
  } catch (err) {
    logger.error(`[GroupUpdate] Error: ${err.message}`);
  }
}

// ===============================================
// 🆕 NO-PREFIX HELPERS
// ===============================================
const normalizeTrigger = (s) => String(s || '').normalize('NFC').replace(/[\uFE0E\uFE0F]/g, '').trim().toLowerCase();

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
  const info = m.extendedTextMessage?.contextInfo || m.imageMessage?.contextInfo || m.videoMessage?.contextInfo || m.audioMessage?.contextInfo || m.documentMessage?.contextInfo || m.stickerMessage?.contextInfo;
  return !!info?.quotedMessage;
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

    if (from === 'status@broadcast' || from.endsWith('@newsletter')) return;
    if (isPayloadBugged(text)) return;

    // Anti-Spam
    if (!owner) {
      const spamCheck = await isSpamming(sender);
      if (spamCheck.spam) return;
    }

    // Cache for Anti-Delete
    try {
      const db = await readDb();
      if (db.global_settings?.antiDelete && !msg.key.fromMe) {
        messageCache.set(msg.key.id, { msg, from, sender });
        if (messageCache.size > 1000) messageCache.delete(messageCache.keys().next().value);
      }
    } catch {}

    // 🆕 NO-PREFIX PLUGIN CHECK
    const noPrefixPlugin = findNoPrefixPlugin(text);
    if (noPrefixPlugin && hasReply(msg)) {
      const ctx = {
        sock, msg, from, sender, isGroup: group, isOwner: owner,
        args: [], text, command: noPrefixPlugin.name, prefix: CONFIG.PREFIX, sessionNumber,
        botNumber: cleanJid(getBotJid(sock)),
        reply: (t, opts = {}) => sock.sendMessage(from, { text: t, ...opts }, { quoted: msg }),
        react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }).catch(() => {}),
        send: (content, opts = {}) => sock.sendMessage(from, content, { quoted: msg, ...opts }),
      };
      try { await sock.readMessages([msg.key]); } catch {}
      try { await noPrefixPlugin.run(ctx); } catch (err) { logger.error(`[NoPrefix] ${err.message}`); }
      return;
    }

    // Skip bot's own non-command messages
    if (msg.key.fromMe) {
      if (!text || !text.startsWith(CONFIG.PREFIX)) return;
    }

    // Anti-Link
    if (group && !owner && !msg.key.fromMe) {
      if (await handleAntilink(sock, msg, from, sender)) return;
    }

    if (!text) return;

    // PREFIX COMMANDS
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
      sock, msg, from, sender, isGroup: group, isOwner: owner,
      args, text, command: plugin.name, prefix, sessionNumber,
      botNumber: cleanJid(getBotJid(sock)), // ✅ Fixed Bot JID
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
  sock.ev.on('group-participants.update', (u) => handleGroupParticipants(sock, u));
  sock.ev.on('messages.update', (u) => handleAntidelete(sock, u));
  sock.ev.on('call', (c) => handleAntiCall(sock, c));
}
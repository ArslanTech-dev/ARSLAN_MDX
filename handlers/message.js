/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧩 MESSAGE.JS — ARSLAN MDX (Ultimate v6.1 — LID Safe + Chatbot)
 * ═══════════════════════════════════════════════════════════════════
 * ✅ Added AI Chatbot Auto-Reply (Pollinations)
 * ✅ Bot apni pehchan (PN + LID) khud jaanta hai 
 * ✅ Group admin/owner checks LID-safe
 * ✅ Proper mentions, Strong AntiLink, AntiDelete, AntiCall
 * ✅ Welcome / Goodbye, No-prefix plugins, Purane messages ignore
 * ═══════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadContentFromMessage, normalizeMessageContent } from '@whiskeysockets/baileys';
import { CONFIG } from '../config.js';
import { extractText, isGroup, isOwner, getSender, nowTime } from '../utils/helper.js';
import { getGroupSettings, readDb } from '../utils/database.js';
import { isPayloadBugged } from '../utils/antibugEngine.js';
import { isSpamming } from '../utils/antispamEngine.js';
import { handleAntiBadwords } from '../plugins/antibadwords.js';
import { handleChatbotResponse } from '../plugins/chatbot.js'; // 🆕 AI Chatbot Import
import {
  digits, isLidJid, getBotIdentity, isBotJid, participantIds, findParticipant,
  collectSenderIds, getGroupMeta, getCachedMeta, invalidateGroupMeta,
  isBotAdminIn, isUserAdmin, autoMentions, bestMentionJid
} from '../utils/groupHelper.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_DIR = path.join(__dirname, '..', 'plugins');

const MAX_MSG_AGE_SEC = 120; // is se purane messages par action nahi

// ─── REGISTRY ───
const plugins = new Map();
const aliases = new Map();
const noPrefixPlugins = [];
let loaded = false;

// ═══════════════════════════════════════════════════════════════════
// 🛠️ SMALL HELPERS
// ═══════════════════════════════════════════════════════════════════
const toNum = (t) => (t && typeof t === 'object' && typeof t.toNumber === 'function' ? t.toNumber() : Number(t));
const asPnJid = (v) => (v ? (String(v).includes('@') ? String(v) : `${digits(v)}@s.whatsapp.net`) : null);

/** Bot ka PN jid (fallback LID) */
function getBotJid(sock) {
  const id = getBotIdentity(sock);
  return id.pnJid || id.lidJid || null;
}

/** "@number" tags wale text se mentions khud banao (plugin ne na diye hon to) */
function withMentions(from, content) {
  if (!content || typeof content !== 'object') return content;
  const t = typeof content.text === 'string' ? content.text : typeof content.caption === 'string' ? content.caption : null;
  if (!t || !/@\d{5,20}/.test(t)) return content;

  const have = Array.isArray(content.mentions) ? content.mentions : [];
  const haveDigits = new Set(have.map(digits));
  const auto = autoMentions(t, isGroup(from) ? getCachedMeta(from) : null).filter((j) => !haveDigits.has(digits(j)));
  return auto.length ? { ...content, mentions: [...have, ...auto] } : content;
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
      const candidates = [mod.default, ...Object.values(mod)].filter((v) => v && v.run && v.name);

      for (const p of candidates) {
        plugins.set(p.name.toLowerCase(), p);
        if (Array.isArray(p.aliases)) {
          for (const a of p.aliases) aliases.set(a.toLowerCase(), p.name.toLowerCase());
        }
        if (p.noPrefix && Array.isArray(p.triggers) && !noPrefixPlugins.includes(p)) {
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

// ═══════════════════════════════════════════════════════════════════
// 🔗 ANTILINK (Strong)
// ═══════════════════════════════════════════════════════════════════
const LINK_PATTERNS = [
  /(?:https?|ftp):\/\/\S+/i,
  /\bwww\.[^\s]+/i,
  /\b(?:chat\.whatsapp\.com|wa\.me|whatsapp\.com\/channel|t\.me|telegram\.me|discord\.gg|discord\.com\/invite|youtu\.be|instagram\.com|facebook\.com|fb\.com|tiktok\.com|bit\.ly|tinyurl\.com)\/?\S*/i,
  /(?<![@\w.-])(?:[a-z0-9-]+\.)+(?:com|net|org|io|me|gg|xyz|info|co|pk|in|tv|app|link|site|online|club|top|shop|store|ly|to|cc|ru|ai|dev|live|vip|fun|pro|biz|us|uk|ws|tk|ml|ga|cf|gq)\b(?:\/\S*)?/i
];

const hasLink = (text) => !!text && LINK_PATTERNS.some((re) => re.test(text));

function extractAllText(msg) {
  const parts = [extractText(msg)];
  try {
    const c = msg.message || {};
    parts.push(
      c.extendedTextMessage?.matchedText,
      c.documentMessage?.caption,
      c.documentWithCaptionMessage?.message?.documentMessage?.caption,
      c.buttonsMessage?.contentText,
      c.templateMessage?.hydratedTemplate?.hydratedContentText
    );
  } catch {}
  return [...new Set(parts.filter(Boolean))].join('\n');
}

const linkWarns = new Map();
const LINK_WARN_LIMIT = 3;
const LINK_WARN_TTL = 60 * 60 * 1000;

async function handleAntilink(sock, msg, from, sender, senderIds) {
  try {
    const settings = await getGroupSettings(from);
    if (!settings.antilink) return false;
    if (!hasLink(extractAllText(msg))) return false;

    if (await isUserAdmin(sock, from, senderIds)) return false;
    if (!(await isBotAdminIn(sock, from))) return false;

    await sock.sendMessage(from, { delete: msg.key });

    const action = settings.antilink_action || 'warn';
    const tag = `@${digits(sender)}`;
    const footer = `> 💫 _POWERED BY ARSLAN MD_ 💫`;

    if (action === 'kick') {
      await sock.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
      await sock.sendMessage(from, {
        text: `> 🔗 *ANTI-LINK*\n> ────────────────\n> 👤 *User:* ${tag}\n> 🚫 Link bheja — group se remove kar diya.\n> ────────────────\n${footer}`,
        mentions: [sender]
      });
    } else if (action === 'warn') {
      const key = `${from}|${digits(sender)}`;
      const now = Date.now();
      const entry = linkWarns.get(key);
      const count = entry && now - entry.ts < LINK_WARN_TTL ? entry.count + 1 : 1;
      linkWarns.set(key, { count, ts: now });
      if (linkWarns.size > 1000) linkWarns.delete(linkWarns.keys().next().value);

      if (count >= LINK_WARN_LIMIT) {
        linkWarns.delete(key);
        await sock.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
        await sock.sendMessage(from, {
          text: `> 🔗 *ANTI-LINK*\n> ────────────────\n> 👤 *User:* ${tag}\n> 🚫 ${LINK_WARN_LIMIT}/${LINK_WARN_LIMIT} warnings — remove kar diya.\n> ────────────────\n${footer}`,
          mentions: [sender]
        });
      } else {
        await sock.sendMessage(from, {
          text: `> 🔗 *ANTI-LINK*\n> ────────────────\n> 👤 *User:* ${tag}\n> ⚠️ *Warning:* ${count}/${LINK_WARN_LIMIT}\n> 🚫 Is group mein links allowed nahi hain.\n> ────────────────\n${footer}`,
          mentions: [sender]
        });
      }
    }
    logger.info(`[ANTILINK] ${action} → ${digits(sender)} in ${from}`);
    return true;
  } catch (err) {
    logger.error(`[AntiLink] ${err.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🗑️ ANTI-DELETE (Strong)
// ═══════════════════════════════════════════════════════════════════
const messageCache = new Map();
const CACHE_MAX_MSGS = 1500;
const MEDIA_MAX_BYTES = 8 * 1024 * 1024;
const MEDIA_CACHE_BUDGET = 80 * 1024 * 1024;
let mediaBytes = 0;

const MEDIA_KINDS = [
  ['imageMessage', 'image'], ['videoMessage', 'video'], ['audioMessage', 'audio'],
  ['stickerMessage', 'sticker'], ['documentMessage', 'document']
];

function pickMedia(content) {
  for (const [key, type] of MEDIA_KINDS) {
    if (content?.[key]) return { type, node: content[key] };
  }
  return null;
}

function dropEntry(id) {
  const e = messageCache.get(id);
  if (e?.media?.buffer) mediaBytes -= e.media.buffer.length;
  messageCache.delete(id);
}

function evictOldest() {
  while (messageCache.size > CACHE_MAX_MSGS || mediaBytes > MEDIA_CACHE_BUDGET) {
    const oldest = messageCache.keys().next().value;
    if (oldest === undefined) break;
    dropEntry(oldest);
  }
}

async function downloadNode(node, type) {
  const stream = await downloadContentFromMessage(node, type);
  const chunks = [];
  let size = 0;
  for await (const c of stream) {
    size += c.length;
    if (size > MEDIA_MAX_BYTES) throw new Error('too big');
    chunks.push(c);
  }
  return Buffer.concat(chunks);
}

async function prefetchMedia(id) {
  const entry = messageCache.get(id);
  if (!entry) return;
  const spec = pickMedia(entry.msg.message);
  if (!spec) return;
  const size = Number(toNum(spec.node.fileLength) || 0);
  if (size && size > MEDIA_MAX_BYTES) return;
  try {
    const buffer = await downloadNode(spec.node, spec.type);
    if (!messageCache.has(id)) return;
    entry.media = {
      type: spec.type, buffer, mimetype: spec.node.mimetype, fileName: spec.node.fileName,
      ptt: !!spec.node.ptt, gif: !!spec.node.gifPlayback, caption: spec.node.caption || ''
    };
    mediaBytes += buffer.length;
    evictOldest();
  } catch {}
}

function cacheForAntiDelete(msg, from, sender, senderPn) {
  const id = msg.key.id;
  if (!id) return;
  messageCache.set(id, { msg, from, sender, senderPn, pushName: msg.pushName || '', ts: Date.now(), media: null, handled: false });
  evictOldest();
  prefetchMedia(id);
}

async function handleAntidelete(sock, updates) {
  try {
    const db = await readDb();
    if (!db.global_settings?.antiDelete) return;

    const identity = getBotIdentity(sock);
    const inbox = identity.pnJid || identity.lidJid;
    if (!inbox) return;

    for (const u of updates) {
      const st = u.update?.messageStubType;
      const isDeleted = u.update?.message === null || st === 1 || st === 'REVOKE' || u.update?.messageStubParameters?.[0] === 'Message deleted';
      if (!isDeleted || !u.key?.id) continue;

      // 🚨 FIX: Agar owner ne khud message delete kiya hai, toh ignore karo
      if (u.key.fromMe === true) {
          dropEntry(u.key.id);
          continue;
      }

      const entry = messageCache.get(u.key.id);
      if (!entry || entry.handled) continue;
      entry.handled = true;

      const { msg: original, from, sender, senderPn, pushName } = entry;
      if (original.key.fromMe || isBotJid(sock, sender) || digits(sender) === digits(CONFIG.OWNER_NUMBER)) {
        dropEntry(u.key.id);
        continue;
      }

      let chatLabel = 'DM';
      if (isGroup(from)) {
        const meta = getCachedMeta(from) || (await getGroupMeta(sock, from));
        chatLabel = `Group — ${meta?.subject || 'Unknown'}`;
      }

      const mentionJid = bestMentionJid(senderPn, sender);
      const content = original.message || {};
      const spec = pickMedia(content);
      const typeLabel = spec ? spec.type : 'text';

      const header =
        `> 🛡️ *ANTI-DELETE TRIGGERED*\n` +
        `> ────────────────\n` +
        `> 👤 *Sender:* @${digits(mentionJid)}${pushName ? ` (${pushName})` : ''}\n` +
        `> 📍 \`Chat   : ${chatLabel}\`\n` +
        `> 🗂️ \`Type   : ${typeLabel}\`\n` +
        `> 🕒 \`Time   : ${nowTime()}\`\n` +
        `> ────────────────\n` +
        `> 💫 _POWERED BY ARSLAN MD_ 💫`;

      try {
        if (spec) {
          let media = entry.media;
          if (!media?.buffer) {
            const buffer = await downloadNode(spec.node, spec.type);
            media = { type: spec.type, buffer, mimetype: spec.node.mimetype, fileName: spec.node.fileName, ptt: !!spec.node.ptt, gif: !!spec.node.gifPlayback, caption: spec.node.caption || '' };
          }
          const cap = media.caption ? `${header}\n\n> 📝 *Caption:* ${media.caption}` : header;

          if (media.type === 'image') await sock.sendMessage(inbox, { image: media.buffer, caption: cap, mentions: [mentionJid] });
          else if (media.type === 'video') await sock.sendMessage(inbox, { video: media.buffer, caption: cap, mimetype: media.mimetype, gifPlayback: media.gif, mentions: [mentionJid] });
          else if (media.type === 'document') await sock.sendMessage(inbox, { document: media.buffer, mimetype: media.mimetype || 'application/octet-stream', fileName: media.fileName || 'file', caption: cap, mentions: [mentionJid] });
          else {
            await sock.sendMessage(inbox, { text: header, mentions: [mentionJid] });
            if (media.type === 'audio') await sock.sendMessage(inbox, { audio: media.buffer, mimetype: media.mimetype || 'audio/mp4', ptt: media.ptt });
            else await sock.sendMessage(inbox, { sticker: media.buffer });
          }
        } else {
          const text = extractAllText(original);
          await sock.sendMessage(inbox, {
            text: text ? `${header}\n\n> 📝 *Message:* ${text}` : `${header}\n\n> ℹ️ _Is message type ka content save nahi ho saka._`,
            mentions: [mentionJid]
          });
        }
      } catch (e) {
        await sock.sendMessage(inbox, { text: `${header}\n\n> ⚠️ Media expired / download nahi ho saka.`, mentions: [mentionJid] }).catch(() => {});
      }
      dropEntry(u.key.id);
    }
  } catch (err) {
    logger.error(`[AntiDelete] ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📵 ANTI-CALL (Strong)
// ═══════════════════════════════════════════════════════════════════
const handledCalls = new Set();

async function handleAntiCall(sock, calls) {
  try {
    const db = await readDb();
    if (!db.global_settings?.antiCall) return;

    const ownerDigits = digits(CONFIG.OWNER_NUMBER);

    for (const call of calls) {
      if (call.status !== 'offer') continue;
      if (!call.id || handledCalls.has(call.id)) continue;
      handledCalls.add(call.id);
      if (handledCalls.size > 200) handledCalls.delete(handledCalls.values().next().value);

      const ids = [call.from, call.callerPn, call.chatId].map(digits).filter(Boolean);
      if (ids.some((d) => d === ownerDigits) || ids.some((d) => getBotIdentity(sock).ids.has(d))) continue;

      try {
        await sock.rejectCall(call.id, call.from);
      } catch (e) {
        logger.error(`[AntiCall] reject failed: ${e.message}`);
        continue;
      }

      if (call.isGroup) continue;

      const kind = call.isVideo ? 'Video Call' : 'Voice Call';
      const callMsg =
        `> 📵 *ANTI-CALL SYSTEM*\n` +
        `> ────────────────\n` +
        `> ⛔ \`Status : ${kind} Auto-Rejected\`\n` +
        `> 💬 \`Reason : Security Protocol\`\n` +
        `> 🕒 \`Time   : ${nowTime()}\`\n` +
        `> ────────────────\n` +
        `> 👉 _Please send a text message instead._\n\n` +
        `> 💫 _POWERED BY ARSLAN MD_ 💫`;

      await sock.sendMessage(asPnJid(call.callerPn) || call.from, { text: callMsg }).catch(() => {});
    }
  } catch (err) {
    logger.error(`[AntiCall] ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 👋 WELCOME / GOODBYE
// ═══════════════════════════════════════════════════════════════════
function normalizeParticipants(list) {
  return (list || []).map((p) => {
      if (typeof p === 'string') return { id: p, pn: p.endsWith('@s.whatsapp.net') ? p : null };
      const id = p.id || p.lid || p.phoneNumber;
      const pn = p.phoneNumber ? asPnJid(p.phoneNumber) : String(id).endsWith('@s.whatsapp.net') ? id : null;
      return { id, pn };
    }).filter((p) => p.id);
}

async function getProfilePic(sock, jid) {
  try {
    return await Promise.race([
      sock.profilePictureUrl(jid, 'image'),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))
    ]);
  } catch { return null; }
}

async function handleGroupParticipants(sock, update) {
  const { id, participants, action, author, authorPn } = update || {};
  try {
    invalidateGroupMeta(id);
    if (action !== 'add' && action !== 'remove') return;

    const settings = await getGroupSettings(id);
    if (action === 'add' && !settings.welcome) return;
    if (action === 'remove' && !settings.goodbye) return;

    const list = normalizeParticipants(participants);
    if (!list.length) return;

    const meta = await getGroupMeta(sock, id, { fresh: true });
    const subject = meta?.subject || 'this group';
    const count = meta?.participants?.length;
    const identity = getBotIdentity(sock);

    for (const p of list) {
      if (identity.ids.has(digits(p.id)) || (p.pn && identity.ids.has(digits(p.pn)))) continue;

      const mentionJid = bestMentionJid(p.pn, p.id);
      const tag = `@${digits(mentionJid)}`;

      if (action === 'add') {
        const caption =
          `> 💚 *WELCOME TO THE GROUP*\n` +
          `> ────────────────\n` +
          `> 👋 Hey ${tag},\n` +
          `> Welcome to *${subject}*!\n` +
          (count ? `> 👥 \`Members : ${count}\`\n` : '') +
          `> 🎉 We are glad to have you here.\n` +
          `> ────────────────\n` +
          `> 💫 _POWERED BY ARSLAN MD_ 💫`;

        const pic = await getProfilePic(sock, p.pn || p.id);
        if (pic) {
          const ok = await sock.sendMessage(id, { image: { url: pic }, caption, mentions: [mentionJid] }).then(() => true).catch(() => false);
          if (ok) continue;
        }
        await sock.sendMessage(id, { text: caption, mentions: [mentionJid] });
      } else {
        const remover = author && digits(author) !== digits(p.id) && digits(author) !== digits(p.pn);
        const byJid = remover ? bestMentionJid(authorPn ? asPnJid(authorPn) : null, author) : null;
        const mentions = byJid ? [mentionJid, byJid] : [mentionJid];

        const caption =
          `> 💔 *GOODBYE*\n` +
          `> ────────────────\n` +
          (remover
            ? `> 👋 ${tag} User from group removed.\n> 🛑 *Removed by:* @${digits(byJid)}\n`
            : `> 👋 ${tag} has left the group.\n`) +
          `> 🥀 We will miss you in *${subject}*.\n` +
          (count ? `> 👥 \`Members : ${count}\`\n` : '') +
          `> ────────────────\n` +
          `> 💫 _POWERED BY ARSLAN MD_ 💫`;

        await sock.sendMessage(id, { text: caption, mentions });
      }
    }
  } catch (err) {
    logger.error(`[GroupUpdate] Error: ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🆕 NO-PREFIX HELPERS
// ═══════════════════════════════════════════════════════════════════
const normalizeTrigger = (s) => String(s || '').normalize('NFC').replace(/[\uFE0E\uFE0F]/g, '').trim().toLowerCase();

function findNoPrefixPlugin(text) {
  if (!text || !noPrefixPlugins.length) return null;
  const norm = normalizeTrigger(text);
  for (const p of noPrefixPlugins) {
    const triggers = Array.isArray(p.triggers) ? p.triggers : [];
    if (triggers.some((t) => normalizeTrigger(t) === norm)) return p;
  }
  return null;
}

function hasReply(msg) {
  const m = msg?.message || {};
  const info = m.extendedTextMessage?.contextInfo || m.imageMessage?.contextInfo || m.videoMessage?.contextInfo || m.audioMessage?.contextInfo || m.documentMessage?.contextInfo || m.stickerMessage?.contextInfo;
  return !!info?.quotedMessage;
}

// ═══════════════════════════════════════════════════════════════════
// 🧱 CONTEXT BUILDER
// ═══════════════════════════════════════════════════════════════════
function buildCtx({ sock, msg, from, sender, senderPn, senderIds, group, owner, args, text, command, prefix, sessionNumber, identity }) {
  return {
    sock, msg, from, sender, isGroup: group, isOwner: owner,
    args, text, command, prefix, sessionNumber,
    botNumber: identity.pn,
    botLid: identity.lid,
    botJid: identity.pnJid,
    botIds: [...identity.ids],
    isBot: (jid) => identity.ids.has(digits(jid)),
    senderPn, senderIds: [...senderIds],
    getMeta: (fresh = false) => (group ? getGroupMeta(sock, from, { fresh }) : Promise.resolve(null)),
    isSenderAdmin: () => (group ? isUserAdmin(sock, from, senderIds) : Promise.resolve(false)),
    isBotAdmin: () => (group ? isBotAdminIn(sock, from) : Promise.resolve(false)),
    reply: (t, opts = {}) => sock.sendMessage(from, withMentions(from, { text: t, ...opts }), { quoted: msg }),
    react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }).catch(() => {}),
    send: (content, opts = {}) => sock.sendMessage(from, withMentions(from, content), { quoted: msg, ...opts }),
  };
}

// ═══════════════════════════════════════════════════════════════════
// 📩 MAIN MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════════
export async function handleMessage(sock, rawMsg, sessionNumber) {
  try {
    await loadPlugins();
    if (!rawMsg?.message) return;

    const inner = normalizeMessageContent(rawMsg.message) || rawMsg.message;
    const msg = inner === rawMsg.message ? rawMsg : { ...rawMsg, message: inner };

    const proto = inner.protocolMessage;
    if (proto) {
      if ((proto.type === 0 || proto.type === 'REVOKE') && proto.key?.id) {
        await handleAntidelete(sock, [{ key: proto.key, update: { message: null } }]);
      }
      return;
    }

    const from = msg.key.remoteJid;
    if (!from || from === 'status@broadcast' || from.endsWith('@newsletter')) return;

    const ts = toNum(msg.messageTimestamp);
    if (ts && Date.now() / 1000 - ts > MAX_MSG_AGE_SEC) return;

    const group = isGroup(from);
    const text = extractText(msg);
    const prefix = CONFIG.PREFIX;

    const identity = getBotIdentity(sock);
    const botJid = identity.pnJid || identity.lidJid;
    const sender = msg.key.fromMe ? botJid : getSender(msg);

    if (isPayloadBugged(text)) return;

    const senderIds = collectSenderIds(msg, sender);
    if (msg.key.fromMe) for (const d of identity.ids) senderIds.add(d);

    const altPn = [msg.key.participantAlt, msg.key.remoteJidAlt].find((j) => String(j || '').endsWith('@s.whatsapp.net'));
    const senderPn = msg.key.fromMe ? identity.pnJid : (String(sender).endsWith('@s.whatsapp.net') ? sender : altPn || null);

    const ownerDigits = digits(CONFIG.OWNER_NUMBER);
    const ownerNow = () => msg.key.fromMe === true || isOwner(sender) || [...senderIds].some((d) => d === ownerDigits || identity.ids.has(d));
    let owner = ownerNow();

    const noPrefixPlugin = findNoPrefixPlugin(text);
    const commandLike = text.startsWith(prefix) || !!noPrefixPlugin;

    if (!owner && group && commandLike && isLidJid(sender)) {
      const meta = getCachedMeta(from) || (await getGroupMeta(sock, from));
      const p = meta ? findParticipant(meta, senderIds) : null;
      if (p) for (const d of participantIds(p)) senderIds.add(d);
      owner = ownerNow();
    }

    if (!owner) {
      const spamCheck = await isSpamming(sender);
      if (spamCheck.spam) return;
    }

    try {
      const db = await readDb();
      if (db.global_settings?.antiDelete && !msg.key.fromMe) {
        cacheForAntiDelete(msg, from, sender, senderPn);
      }
    } catch {}

    // 🆕 NO-PREFIX PLUGIN
    if (noPrefixPlugin && hasReply(msg) && !(noPrefixPlugin.ownerOnly && !owner)) {
      const ctx = buildCtx({
        sock, msg, from, sender, senderPn, senderIds, group, owner,
        args: [], text, command: noPrefixPlugin.name, prefix, sessionNumber, identity
      });
      if (noPrefixPlugin.markRead) { try { await sock.readMessages([msg.key]); } catch {} }
      let handled = true;
      try {
        const result = await noPrefixPlugin.run(ctx);
        if (result === false) handled = false;
      } catch (err) {
        logger.error(`[NoPrefix] ${err.message}`);
      }
      if (handled) return;
    }

    if (msg.key.fromMe) {
      if (!text || !text.startsWith(prefix)) return;
    }

    if (group && !owner && !msg.key.fromMe) {
      if (text && (await handleAntiBadwords(sock, msg, from, sender, text))) return;
      if (await handleAntilink(sock, msg, from, sender, senderIds)) return;
    }

    if (!text) return;

    // 🆕 CHATBOT AI AUTO-REPLY
    // Agar message kisi prefix se shuru nahi hota aur chatbot on hai, toh AI reply karega
    if (!text.startsWith(prefix)) {
        handleChatbotResponse(sock, msg, from, text, sessionNumber).catch((err) => {
            logger.error(`[CHATBOT] Error: ${err.message}`);
        });
        return; // Prefix command nahi hai, toh aage mat badho
    }

    // PREFIX COMMANDS
    const parts = text.slice(prefix.length).trim().split(/\s+/);
    const cmdRaw = (parts[0] || '').toLowerCase();
    const args = parts.slice(1);

    let plugin = plugins.get(cmdRaw);
    if (!plugin && aliases.has(cmdRaw)) plugin = plugins.get(aliases.get(cmdRaw));
    if (!plugin) return;

    if (plugin.ownerOnly && !owner) return;
    if (plugin.groupOnly && !group) return;
    if (plugin.privateOnly && group) return;

    const ctx = buildCtx({
      sock, msg, from, sender, senderPn, senderIds, group, owner,
      args, text, command: plugin.name, prefix, sessionNumber, identity
    });

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

// ═══════════════════════════════════════════════════════════════════
// ⚙️ EVENT SETUP
// ═══════════════════════════════════════════════════════════════════
export function setupEvents(sock, sessionNumber) {
  sock.ev.on('group-participants.update', (u) => handleGroupParticipants(sock, u));
  sock.ev.on('groups.update', (list) => { for (const g of list || []) invalidateGroupMeta(g.id); });
  sock.ev.on('messages.update', (u) => handleAntidelete(sock, u));
  sock.ev.on('call', (c) => handleAntiCall(sock, c));
}
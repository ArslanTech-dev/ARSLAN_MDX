/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🪾 VIEWONCE2.JS — ARSLAN MDX · No-Prefix ViewOnce Retriever     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  NO PREFIX — just reply to a viewOnce message with:              ║
 * ║    beautiful · * · cute · oh · 🙂 · nice · ok · ❤️ · 😘 · ❤ ·    ║
 * ║    😍 · 🔥 · ? · 👀 · wow · 👍                                  ║
 * ║                                                                  ║
 * ║  Result: media → sender's DM (fallback to chat if DM fails)      ║
 * ║                                                                  ║
 * ║  ⚠️  NOTE: No `vv2` alias here — that's `.forward` in viewonce.js ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import {
  downloadContentFromMessage,
  normalizeMessageContent,
} from '@whiskeysockets/baileys';
import { cleanJid } from '../utils/helper.js';
import logger from '../utils/logger.js';

// ═══════════════════════════════════════════════════════════════════
// 🎯 TRIGGERS
// ═══════════════════════════════════════════════════════════════════
const TRIGGERS = [
  'beautiful', '*', 'cute', 'oh', '🙂', 'nice', 'ok',
  '❤️', '😘', '❤', '😍', '🔥', '?', '👀', 'wow', '👍',
  // extras (typo / case tolerant)
  'beauty', 'okay', 'okk', 'k', 'yes', 'hm', 'hmm',
];

const MAX_MEDIA_BYTES = 64 * 1024 * 1024; // 64 MB

// ═══════════════════════════════════════════════════════════════════
// 🛠️ HELPERS
// ═══════════════════════════════════════════════════════════════════
const normalize = (s) =>
  String(s || '')
    .normalize('NFC')
    .replace(/[\uFE0E\uFE0F]/g, '')
    .trim()
    .toLowerCase();

function getContextInfo(msg) {
  const m = msg?.message || {};
  return (
    m.extendedTextMessage?.contextInfo ||
    m.imageMessage?.contextInfo ||
    m.videoMessage?.contextInfo ||
    m.audioMessage?.contextInfo ||
    m.documentMessage?.contextInfo ||
    m.stickerMessage?.contextInfo ||
    null
  );
}

function extractViewOnce(quoted) {
  try {
    if (!quoted) return null;

    logger.info(`[VV2] quoted keys: ${Object.keys(quoted).join(', ')}`);

    let content = normalizeMessageContent(quoted) || quoted;

    const tryUnwrap = (c) => {
      if (!c) return c;
      if (c.viewOnceMessage?.message)             return tryUnwrap(c.viewOnceMessage.message);
      if (c.viewOnceMessageV2?.message)           return tryUnwrap(c.viewOnceMessageV2.message);
      if (c.viewOnceMessageV2Extension?.message)  return tryUnwrap(c.viewOnceMessageV2Extension.message);
      if (c.ephemeralMessage?.message)            return tryUnwrap(c.ephemeralMessage.message);
      return c;
    };

    content = tryUnwrap(content);
    logger.info(`[VV2] unwrapped keys: ${Object.keys(content || {}).join(', ')}`);

    if (content.imageMessage) {
      logger.info(`[VV2] ✅ imageMessage | viewOnce=${content.imageMessage.viewOnce}`);
      return { type: 'image', data: content.imageMessage };
    }
    if (content.videoMessage) {
      logger.info(`[VV2] ✅ videoMessage | viewOnce=${content.videoMessage.viewOnce}`);
      return { type: 'video', data: content.videoMessage };
    }
    if (content.audioMessage) {
      logger.info(`[VV2] ✅ audioMessage | viewOnce=${content.audioMessage.viewOnce}`);
      return { type: 'audio', data: content.audioMessage };
    }

    logger.info(`[VV2] ❌ No media in unwrapped content`);
    return null;
  } catch (err) {
    logger.error(`[VV2] extract error: ${err.message}`);
    return null;
  }
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
      logger.warn(`[VV2] Retry ${attempt + 1}/${retries}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📦 PLUGIN
// ═══════════════════════════════════════════════════════════════════
export const viewonce2 = {
  name: 'viewonce2',
  aliases: [],              // ✅ no aliases (vv2 belongs to .forward now)
  noPrefix: true,           // ✅ triggers on plain text
  requiresReply: true,      // ✅ must be a reply
  triggers: TRIGGERS,

  async run(ctx) {
    const { sock, msg, sender, from, reply, react } = ctx;

    logger.info(`[VV2] ▶ run() | sender=${cleanJid(sender)} from=${from}`);

    // 1. Get quoted
    const ctxInfo = getContextInfo(msg);
    if (!ctxInfo?.quotedMessage) {
      logger.info(`[VV2] ❌ No quotedMessage`);
      return;
    }

    // 2. Extract viewOnce
    const media = extractViewOnce(ctxInfo.quotedMessage);
    if (!media) {
      logger.info(`[VV2] ❌ Not a viewOnce media`);
      return;
    }

    try { await react('📥'); } catch {}

    try {
      // 3. Size check
      const fileLength = Number(media.data.fileLength || 0);
      if (fileLength > MAX_MEDIA_BYTES) {
        throw new Error(
          `Too large (${Math.round(fileLength / 1024 / 1024)} MB)`
        );
      }

      // 4. Download
      logger.info(`[VV2] ⬇ Downloading ${media.type}...`);
      const buffer = await tryDownload(media, 2);
      logger.info(`[VV2] ✅ Downloaded ${buffer.length} bytes`);

      // 5. Caption
      const caption =
        `> 🪾 *VIEW-ONCE RETRIEVED*\n` +
        `> ────────────────\n` +
        `> 📥 \`Type : ${media.type.toUpperCase()}\`\n` +
        `> 👤 \`From : @${cleanJid(sender)}\`\n` +
        `> 📊 \`Size : ${Math.round(buffer.length / 1024)} KB\`\n` +
        (media.data.caption ? `> 📝 \`Caption : ${media.data.caption}\`\n` : '') +
        `> ────────────────\n` +
        `> 💫 _POWERED BY ARSLAN MD_ 💫`;

      // 6. Payload
      const payload = { caption, mentions: [sender] };
      if (media.type === 'image') {
        payload.image = buffer;
      } else if (media.type === 'video') {
        payload.video = buffer;
      } else if (media.type === 'audio') {
        payload.audio = buffer;
        payload.mimetype = media.data.mimetype || 'audio/ogg; codecs=opus';
        payload.ptt = !!media.data.ptt;
      }

      // 7. Send to sender's DM (fallback to chat)
      let sentTo = null;
      try {
        await sock.sendMessage(sender, payload);
        sentTo = 'dm';
        logger.info(`[VV2] ✅ Sent to DM: ${cleanJid(sender)}`);
      } catch (dmErr) {
        logger.warn(`[VV2] DM failed (${dmErr.message}), trying chat...`);
        try {
          await sock.sendMessage(from, payload);
          sentTo = 'chat';
          logger.info(`[VV2] ✅ Sent to chat: ${from}`);
        } catch (chatErr) {
          throw new Error(`Both DM & chat failed: ${chatErr.message}`);
        }
      }

      // 8. Confirm in chat
      try {
        await reply(
          sentTo === 'dm'
            ? `> ✅ *Sent to your inbox!*`
            : `> ✅ *Sent here (DM unavailable).*`
        );
      } catch {}

      try { await react('✅'); } catch {}
    } catch (err) {
      logger.error(`[VV2] ❌ Failed: ${err.message}`);
      try { await react('❌'); } catch {}
      try {
        await reply(`> ❌ *Failed*\n> ╰─➤ ${err.message}`);
      } catch {}
    }
  },
};
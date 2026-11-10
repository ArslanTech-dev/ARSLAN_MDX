/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🪾 VIEWONCE2.JS — ARSLAN MDX · View-Once Retriever (v1)         ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  NO PREFIX required.                                             ║
 * ║                                                                  ║
 * ║  HOW: Reply to ANY viewOnce photo/video/voice with one trigger:  ║
 * ║    beautiful · * · cute · oh · 🙂 · nice · ok · ❤️ · 😘 · ❤ ·     ║
 * ║    😍 · 🔥 · ? · 👀 · wow · 👍                                  ║
 * ║                                                                  ║
 * ║  Result: The viewOnce media is downloaded and sent to the        ║
 * ║          sender's DM/inbox.                                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import {
  downloadContentFromMessage,
  normalizeMessageContent,
} from '@whiskeysockets/baileys';
import { cleanJid } from '../utils/helper.js';
import logger from '../utils/logger.js';

// ═══════════════════════════════════════════════════════════════════
// 🎯 TRIGGERS — exact list from ARSLAN MDX update
// ═══════════════════════════════════════════════════════════════════
const TRIGGERS = [
  'beautiful', '*', 'cute', 'oh', '🙂', 'nice', 'ok',
  '❤️', '😘', '❤', '😍', '🔥', '?', '👀', 'wow', '👍',
];

// ═══════════════════════════════════════════════════════════════════
// 🛠️ HELPERS
// ═══════════════════════════════════════════════════════════════════
const MAX_MEDIA_BYTES = 64 * 1024 * 1024; // 64 MB

/** Normalize — strip variation selectors so ❤️ & ❤ match */
const normalize = (s) =>
  String(s || '')
    .normalize('NFC')
    .replace(/[\uFE0E\uFE0F]/g, '')
    .trim()
    .toLowerCase();

/** Check if quoted message contains viewOnce media */
function extractViewOnce(quotedMessage) {
  try {
    if (!quotedMessage) return null;
    const content = normalizeMessageContent(quotedMessage) || quotedMessage;

    // Unwrap viewOnce containers
    const inner =
      content.viewOnceMessage?.message ||
      content.viewOnceMessageV2?.message ||
      content.viewOnceMessageV2Extension?.message ||
      content;

    if (inner.imageMessage) return { type: 'image', data: inner.imageMessage };
    if (inner.videoMessage) return { type: 'video', data: inner.videoMessage };
    if (inner.audioMessage) return { type: 'audio', data: inner.audioMessage };

    return null;
  } catch (err) {
    logger.error(`[VIEWONCE2] Extract failed: ${err.message}`);
    return null;
  }
}

/** Find contextInfo from any message type */
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

// ═══════════════════════════════════════════════════════════════════
// 📦 PLUGIN
// ═══════════════════════════════════════════════════════════════════
export const viewonce2 = {
  name: 'viewonce2',
  aliases: ['vv2'],
  noPrefix: true,       // 🔑 no prefix needed
  requiresReply: true,  // 🔑 only trigger if msg is a reply
  triggers: TRIGGERS,

  async run(ctx) {
    const { sock, msg, sender, from, reply, react } = ctx;

    // 1. Get quoted message
    const ctxInfo = getContextInfo(msg);
    if (!ctxInfo?.quotedMessage) return;

    // 2. Extract viewOnce
    const media = extractViewOnce(ctxInfo.quotedMessage);
    if (!media) return; // not a viewonce → silently ignore

    try { await react('📥'); } catch {}

    try {
      // 3. Size check
      const fileLength = Number(media.data.fileLength || 0);
      if (fileLength > MAX_MEDIA_BYTES) {
        throw new Error(
          `Media too large (${Math.round(fileLength / 1024 / 1024)} MB)`
        );
      }

      // 4. Download
      const stream = await downloadContentFromMessage(media.data, media.type);
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      if (!buffer.length) throw new Error('Empty media');

      // 5. Build caption
      const caption =
        `> 🪾 *VIEW-ONCE RETRIEVED*\n` +
        `> ────────────────\n` +
        `> 📥 \`Type  : ${media.type.toUpperCase()}\`\n` +
        `> 👤 \`From  : @${cleanJid(sender)}\`\n` +
        `> 📊 \`Size  : ${Math.round(buffer.length / 1024)} KB\`\n` +
        `> ────────────────\n` +
        `> 💫 _POWERED BY ARSLAN MD_ 💫`;

      // 6. Send to sender's DM
      const payload = { caption, mentions: [sender] };

      if (media.type === 'image') payload.image = buffer;
      else if (media.type === 'video') payload.video = buffer;
      else if (media.type === 'audio') {
        payload.audio = buffer;
        payload.mimetype = media.data.mimetype || 'audio/mp4';
        payload.ptt = !!media.data.ptt;
      }

      await sock.sendMessage(sender, payload);

      // 7. Confirm in current chat
      try {
        await reply(`> ✅ *Sent to your inbox!*`);
      } catch {}

      try { await react('✅'); } catch {}
      logger.info(
        `[VIEWONCE2] ✅ Retrieved ${media.type} for ${cleanJid(sender)}`
      );
    } catch (err) {
      logger.error(`[VIEWONCE2] ❌ Failed: ${err.message}`);
      try { await react('❌'); } catch {}
      try {
        await reply(
          `> ❌ *Failed to retrieve view-once*\n` +
          `> ╰─➤ ${err.message}`
        );
      } catch {}
    }
  },
};
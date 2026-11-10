/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🪾 VIEWONCE2.JS — ARSLAN MDX · Stealth ViewOnce Retriever       ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  NO PREFIX — reply with: nice, cute, ?, ❤️, etc.                 ║
 * ║                                                                  ║
 * ║  🚨 STEALTH MODE:                                                ║
 * ║  The media is sent ONLY to the bot's own Self-Chat.              ║
 * ║  No reply, no reaction, no trace left in the chat.               ║
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
  'beauty', 'okay', 'okk', 'k', 'yes', 'hm', 'hmm',
];

const MAX_MEDIA_BYTES = 64 * 1024 * 1024; // 64 MB

// ═══════════════════════════════════════════════════════════════════
// 🛠️ HELPERS
// ═══════════════════════════════════════════════════════════════════
const normalize = (s) =>
  String(s || '').normalize('NFC').replace(/[\uFE0E\uFE0F]/g, '').trim().toLowerCase();

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

    if (content.imageMessage) return { type: 'image', data: content.imageMessage };
    if (content.videoMessage) return { type: 'video', data: content.videoMessage };
    if (content.audioMessage) return { type: 'audio', data: content.audioMessage };

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
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📦 PLUGIN
// ═══════════════════════════════════════════════════════════════════
export const viewonce2 = {
  name: 'viewonce2',
  aliases: [],
  noPrefix: true,
  requiresReply: true,
  triggers: TRIGGERS,

  async run(ctx) {
    const { sock, msg, sender } = ctx;

    // 1. Get quoted message
    const ctxInfo = getContextInfo(msg);
    if (!ctxInfo?.quotedMessage) return;

    // 2. Extract viewOnce
    const media = extractViewOnce(ctxInfo.quotedMessage);
    if (!media) return;

    try {
      // 3. Size check
      const fileLength = Number(media.data.fileLength || 0);
      if (fileLength > MAX_MEDIA_BYTES) {
        throw new Error(`Too large (${Math.round(fileLength / 1024 / 1024)} MB)`);
      }

      // 4. Download silently
      const buffer = await tryDownload(media, 2);

      // 5. Caption for Self-Chat
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

      // 7. Send to Bot's OWN number (Message Yourself)
      const botJid = sock.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : null;
      
      if (!botJid) throw new Error('Bot JID missing');
      
      await sock.sendMessage(botJid, payload);
      logger.info(`[VV2] ✅ Stealth saved to Self-Chat from ${cleanJid(sender)}`);

      // 🚨 NO REPLY, NO REACTION (Completely Silent)
      // Yahan pehle reply aur react ka code tha, usko hata diya gaya hai.

    } catch (err) {
      logger.error(`[VV2] ❌ Failed: ${err.message}`);
      // Fail hone par bhi chat mein kuch nahi bolega, taake pata na chale.
    }
  },
};
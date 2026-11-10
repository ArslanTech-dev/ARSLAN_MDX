/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  👁️ VIEWONCE.JS — ARSLAN MDX · View-Once Revealer (v2 Fixed)     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Commands:                                                       ║
 * ║    • .vv / .viewonce / .reveal  → reveal in same chat            ║
 * ║    • .forward / .fw             → same, but "forwarded" tag      ║
 * ║                                                                  ║
 * ║  NOTE: `.vv2` alias is now handled by `viewonce2.js` (no-prefix) ║
 * ║  Fixes: size limit · retry · cooldown · all reply types          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import {
  downloadContentFromMessage,
  normalizeMessageContent,
} from '@whiskeysockets/baileys';
import { cleanJid } from '../utils/helper.js';
import logger from '../utils/logger.js';

const MAX_MEDIA_BYTES = 50 * 1024 * 1024; // 50 MB

// ─── HELPER: Get contextInfo from any message type ───
function getQuotedMessage(msg) {
  const m = msg?.message || {};
  const info =
    m.extendedTextMessage?.contextInfo ||
    m.imageMessage?.contextInfo ||
    m.videoMessage?.contextInfo ||
    m.audioMessage?.contextInfo ||
    m.documentMessage?.contextInfo ||
    m.stickerMessage?.contextInfo ||
    null;
  return info?.quotedMessage || null;
}

// ─── HELPER: Download media with retry ───
const downloadMedia = async (mediaKey, mediaType, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const stream = await downloadContentFromMessage(mediaKey, mediaType);
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      if (buffer.length) return buffer;
      throw new Error('Empty buffer');
    } catch (err) {
      if (attempt === retries) throw err;
      logger.warn(`[VV] Retry ${attempt + 1}/${retries}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 500));
    }
  }
};

// ─── HELPER: Extract View-Once Content (Universal) ───
function extractViewOnce(quotedMsg) {
  let normalized = normalizeMessageContent(quotedMsg) || quotedMsg;

  // Unwrap any remaining viewOnce variants
  const tryUnwrap = (c) => {
    if (!c) return c;
    if (c.viewOnceMessage?.message)             return tryUnwrap(c.viewOnceMessage.message);
    if (c.viewOnceMessageV2?.message)           return tryUnwrap(c.viewOnceMessageV2.message);
    if (c.viewOnceMessageV2Extension?.message)  return tryUnwrap(c.viewOnceMessageV2Extension.message);
    if (c.ephemeralMessage?.message)            return tryUnwrap(c.ephemeralMessage.message);
    return c;
  };

  normalized = tryUnwrap(normalized);

  if (normalized.imageMessage)         return { type: 'image', content: normalized.imageMessage };
  if (normalized.videoMessage)         return { type: 'video', content: normalized.videoMessage };
  if (normalized.audioMessage)         return { type: 'audio', content: normalized.audioMessage };
  if (normalized.conversation)         return { type: 'text',  content: normalized.conversation };
  if (normalized.extendedTextMessage)  return { type: 'text',  content: normalized.extendedTextMessage.text };

  return null;
}

// ─── HELPER: Cooldown (3s per user) ───
const cooldown = new Map();
const digits = (jid) => String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');
function onCooldown(ctx) {
  const key = digits(ctx.sender) || ctx.from;
  const now = Date.now();
  if (now - (cooldown.get(key) || 0) < 3000) return true;
  cooldown.set(key, now);
  if (cooldown.size > 500) cooldown.delete(cooldown.keys().next().value);
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// 🏭 COMMAND FACTORY (shared by vv & forward)
// ═══════════════════════════════════════════════════════════════════
function createRevealCommand({ name, aliases, emoji, title, label }) {
  return {
    name,
    aliases,
    async run(ctx) {
      try {
        const quotedMsg = getQuotedMessage(ctx.msg);
        if (!quotedMsg) {
          return ctx.reply(
            `> ❌ Reply karo kisi *View-Once* photo/video/voice pe.`
          );
        }

        const vvData = extractViewOnce(quotedMsg);
        if (!vvData) {
          return ctx.reply(
            `> ❌ Ye View-Once message nahi hai.\n` +
            `> ╰─➤ Ya media *expired* ho chuki hai.`
          );
        }

        if (onCooldown(ctx)) return;
        try { await ctx.react(emoji); } catch {}

        const { type, content } = vvData;

        // Size check
        const fileLength = Number(content.fileLength || 0);
        if (fileLength > MAX_MEDIA_BYTES) {
          throw new Error(
            `Media too large (${Math.round(fileLength / 1024 / 1024)} MB)`
          );
        }

        // Caption
        let caption = `> ${emoji} *${title}*\n`;
        caption += `> ────────────────\n`;
        caption += `> 📁 \`Type : ${type.toUpperCase()}\`\n`;
        if (content.caption) caption += `> 📝 \`Caption : ${content.caption}\`\n`;
        caption += `> ────────────────\n`;
        caption += `> 💫 _POWERED BY ARSLAN MD_`;

        // Send
        if (type === 'image') {
          const buffer = await downloadMedia(content, 'image');
          await ctx.send({ image: buffer, caption });
        } else if (type === 'video') {
          const buffer = await downloadMedia(content, 'video');
          await ctx.send({ video: buffer, caption });
        } else if (type === 'audio') {
          const buffer = await downloadMedia(content, 'audio');
          await ctx.send({
            audio: buffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
          });
        } else if (type === 'text') {
          const text = content.text || content;
          await ctx.reply(
            `> ${emoji} *${label}*\n\n> ${text}\n\n> 💫 _POWERED BY ARSLAN MD_`
          );
        }

        logger.info(`[${name.toUpperCase()}] ✅ ${type} revealed for ${cleanJid(ctx.sender)}`);
        try { await ctx.react('✅'); } catch {}
      } catch (err) {
        logger.error(`[${name.toUpperCase()}] Failed: ${err.message}`);
        try { await ctx.react('❌'); } catch {}
        await ctx.reply(`> ❌ *Error:*\n> ╰─➤ ${err.message}`);
      }
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// 📦 COMMANDS
// ═══════════════════════════════════════════════════════════════════

/** `.vv` — reveal in same chat */
export const vv = createRevealCommand({
  name: 'vv',
  aliases: ['viewonce', 'reveal'],
  emoji: '🔓',
  title: 'VIEW-ONCE REVEALED',
  label: 'VIEW-ONCE TEXT',
});

/** `.forward` — forward without viewonce flag (renamed from vv2) */
export const forward = createRevealCommand({
  name: 'forward',
  aliases: ['fw'],
  emoji: '🔄',
  title: 'FORWARDED FROM VIEW-ONCE',
  label: 'FORWARDED TEXT',
});
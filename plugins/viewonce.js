/**
 * ═══════════════════════════════════════════════════════════════════
 * 👁️ VIEWONCE.JS — ARSLAN MDX View-Once Revealer
 * ═══════════════════════════════════════════════════════════════════
 * Commands: .vv (download & resend), .vv2 (forward without flag)
 * Supports: viewOnceMessage, viewOnceMessageV2, viewOnceMessageV2Extension
 */

import { downloadContentFromMessage, normalizeMessageContent } from '@whiskeysockets/baileys';
import logger from '../utils/logger.js';

// ─── HELPER: Download media from view-once message ───
const downloadMedia = async (mediaKey, mediaType) => {
    const stream = await downloadContentFromMessage(mediaKey, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
};

// ─── HELPER: Extract View-Once Content (Universal) ───
function extractViewOnce(quotedMsg) {
    // Unwrap all view-once variants
    let normalized = normalizeMessageContent(quotedMsg);
    if (!normalized) normalized = quotedMsg;

    if (normalized.imageMessage) return { type: 'image', content: normalized.imageMessage };
    if (normalized.videoMessage) return { type: 'video', content: normalized.videoMessage };
    if (normalized.audioMessage) return { type: 'audio', content: normalized.audioMessage };
    if (normalized.conversation) return { type: 'text', content: normalized.conversation };
    if (normalized.extendedTextMessage) return { type: 'text', content: normalized.extendedTextMessage.text };

    return null;
}

// ═══════════════════════════════════════════════════════════════════
// 1. VV — Download & Send as Normal Media
// ═══════════════════════════════════════════════════════════════════
export const vv = {
  name: 'vv',
  aliases: ['viewonce', 'reveal'],
  async run(ctx) {
    try {
      const quotedMsg = ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (!quotedMsg) {
        return ctx.reply(`> ❌ Reply karo kisi View-Once photo/video/voice pe.`);
      }

      const vvData = extractViewOnce(quotedMsg);
      if (!vvData) {
        return ctx.reply(`> ❌ Ye View-Once message nahi hai.\n> Ya media recover nahi ho saka.`);
      }

      await ctx.react('⏳');

      const { type, content } = vvData;
      
      // 🎨 Simple Caption
      let caption = `> 🔓 *VIEW-ONCE REVEALED*\n> 📁 *Type:* ${type.toUpperCase()}`;
      if (content.caption) caption += `\n> 📝 *Caption:* ${content.caption}`;
      caption += `\n\n> © POWERED BY ARSLAN MD`;

      // Handle Media Types
      if (type === 'image') {
        const buffer = await downloadMedia(content, 'image');
        await ctx.send({ image: buffer, caption });
      } 
      else if (type === 'video') {
        const buffer = await downloadMedia(content, 'video');
        await ctx.send({ video: buffer, caption });
      } 
      else if (type === 'audio') {
        const buffer = await downloadMedia(content, 'audio');
        await ctx.send({ 
          audio: buffer, 
          mimetype: 'audio/ogg; codecs=opus', 
          ptt: true 
        });
      } 
      else if (type === 'text') {
        const text = content.text || content;
        await ctx.reply(`> 🔓 *VIEW-ONCE TEXT*\n\n> ${text}\n\n> © POWERED BY ARSLAN MD`);
      }

      logger.success(`[VV] ${type} revealed successfully.`);
      await ctx.react('✅');

    } catch (err) {
      logger.error(`[VV] Failed: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Error:* ${err.message}`);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2. VV2 — Forward Without View-Once Flag
// ═══════════════════════════════════════════════════════════════════
export const vv2 = {
  name: 'vv2',
  aliases: ['forward', 'fw'],
  async run(ctx) {
    try {
      const quotedMsg = ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (!quotedMsg) {
        return ctx.reply(`> ❌ Reply karo kisi View-Once message pe.`);
      }

      const vvData = extractViewOnce(quotedMsg);
      if (!vvData) {
        return ctx.reply(`> ❌ Ye View-Once message nahi hai.`);
      }

      await ctx.react('🔄');

      const { type, content } = vvData;

      // 🎨 Simple Caption
      let caption = `> 🔄 *FORWARDED FROM VIEW-ONCE*\n> 📁 *Type:* ${type.toUpperCase()}`;
      if (content.caption) caption += `\n> 📝 *Caption:* ${content.caption}`;
      caption += `\n\n> © POWERED BY ARSLAN MD`;

      // Handle Media Types
      if (type === 'image') {
        const buffer = await downloadMedia(content, 'image');
        await ctx.send({ image: buffer, caption });
      } 
      else if (type === 'video') {
        const buffer = await downloadMedia(content, 'video');
        await ctx.send({ video: buffer, caption });
      } 
      else if (type === 'audio') {
        const buffer = await downloadMedia(content, 'audio');
        await ctx.send({ 
          audio: buffer, 
          mimetype: 'audio/ogg; codecs=opus', 
          ptt: true 
        });
      } 
      else if (type === 'text') {
        const text = content.text || content;
        await ctx.reply(`> 🔄 *FORWARDED TEXT*\n\n> ${text}\n\n> © POWERED BY ARSLAN MD`);
      }

      logger.success(`[VV2] ${type} forwarded successfully.`);
      await ctx.react('✅');

    } catch (err) {
      logger.error(`[VV2] Failed: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Error:* ${err.message}`);
    }
  }
};
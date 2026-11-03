/**
 * ═══════════════════════════════════════════════════════════════════
 * 👁️ VIEWONCE.JS — View Once Bypass (Universal Fix)
 * ═══════════════════════════════════════════════════════════════════
 * Handles viewOnceMessage, viewOnceMessageV2, viewOnceMessageV2Extension,
 * and standard imageMessage/videoMessage with viewOnce flag.
 */

import { downloadContentFromMessage, normalizeMessageContent } from '@whiskeysockets/baileys';
import logger from '../utils/logger.js';

// 🚀 View Channel Context (Forwarded Style)
const getContextInfo = () => {
  return {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363412450457588@newsletter', 
      newsletterName: 'ARSLAN MDX',
      serverMessageId: 143
    }
  };
};

// ─── HELPER: Download media from message ───
const downloadMedia = async (mediaKey, mediaType) => {
    const stream = await downloadContentFromMessage(mediaKey, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
};

// ─── HELPER: Extract Media Content (Universal) ───
function extractMedia(quotedMsg) {
    // 1. Normalize the message to unwrap viewOnceMessage, viewOnceMessageV2, etc.
    let normalized = normalizeMessageContent(quotedMsg);
    
    // If normalization returns null, fallback to direct object
    if (!normalized) normalized = quotedMsg;

    // 2. Check for media types directly
    if (normalized.imageMessage) return { type: 'image', content: normalized.imageMessage };
    if (normalized.videoMessage) return { type: 'video', content: normalized.videoMessage };
    if (normalized.audioMessage) return { type: 'audio', content: normalized.audioMessage };

    return null;
}

// ═══════════════════════════════════════════════════════════════════
// 1. VV — View Once Bypass
// ═══════════════════════════════════════════════════════════════════
export const vv = {
  name: 'vv',
  aliases: ['viewonce', 'reveal'],
  async run(ctx) {
    try {
      const quotedMsg = ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (!quotedMsg) {
        return ctx.reply(`> ❌ *Reply to a photo, video, or voice note.*`);
      }

      const mediaData = extractMedia(quotedMsg);
      
      if (!mediaData) {
        return ctx.reply(`> ❌ *No media found in the replied message.*`);
      }

      await ctx.react('⏳');

      const { type, content } = mediaData;
      
      let caption = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋🔓 *𝐕𝐈𝐄𝐖-𝐎𝐍𝐂𝐄 𝐁𝐘𝐏𝐀𝐒𝐒*
┇◆┋
┇◆┋📁 *Type:* ${type.toUpperCase()}
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

      if (content.caption) {
          caption += `\n\n📝 *Caption:* ${content.caption}`;
      }

      // Handle Media Types
      if (type === 'image') {
        const buffer = await downloadMedia(content, 'image');
        await ctx.send({ image: buffer, caption, contextInfo: getContextInfo() });
      } 
      else if (type === 'video') {
        const buffer = await downloadMedia(content, 'video');
        await ctx.send({ video: buffer, caption, contextInfo: getContextInfo() });
      } 
      else if (type === 'audio') {
        const buffer = await downloadMedia(content, 'audio');
        await ctx.send({ 
            audio: buffer, 
            mimetype: 'audio/ogg; codecs=opus', 
            ptt: true, 
            contextInfo: getContextInfo() 
        });
      }

      logger.success(`[VV] ${type} recovered successfully.`);
      await ctx.react('✅');

    } catch (err) {
      logger.error(`[VV] Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Error:* ${err.message}`);
    }
  }
};
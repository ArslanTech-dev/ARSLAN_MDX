/**
 * ═══════════════════════════════════════════════════════════════════
 * 👁️ VIEWONCE.JS — View Once Bypass (ES Modules)
 * ═══════════════════════════════════════════════════════════════════
 * Commands: .vv (download & resend)
 */

import { downloadContentFromMessage } from '@whiskeysockets/baileys';
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

// ─── HELPER: Download media from view-once message ───
const downloadMedia = async (mediaKey, mediaType) => {
    const stream = await downloadContentFromMessage(mediaKey, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
};

// ─── HELPER: Extract View-Once Content (V1 & V2) ───
function extractViewOnce(quotedMsg) {
    let vvMsg = null;
    if (quotedMsg.viewOnceMessage) vvMsg = quotedMsg.viewOnceMessage.message;
    else if (quotedMsg.viewOnceMessageV2) vvMsg = quotedMsg.viewOnceMessageV2.message;
    else if (quotedMsg.viewOnceMessageV2Extension) vvMsg = quotedMsg.viewOnceMessageV2Extension.message;
    
    if (!vvMsg) return null;
    const type = Object.keys(vvMsg)[0];
    return { type, content: vvMsg[type] };
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
        return ctx.reply(`> ❌ *Reply to a View-Once photo/video/voice.*`);
      }

      const vvData = extractViewOnce(quotedMsg);
      if (!vvData) {
        return ctx.reply(`> ❌ *This is not a View-Once message.*`);
      }

      await ctx.react('⏳');

      const { type, content } = vvData;
      let caption = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋🔓 *𝐕𝐈𝐄𝐖-𝐎𝐍𝐂𝐄 𝐁𝐘𝐏𝐀𝐒𝐒*
┇◆┋
┇◆┋📁 *Type:* ${type.replace('Message', '').toUpperCase()}
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

      if (content.caption) {
          caption += `\n\n📝 *Caption:* ${content.caption}`;
      }

      // Handle Media Types
      if (type === 'imageMessage') {
        const buffer = await downloadMedia(content, 'image');
        await ctx.send({ image: buffer, caption, contextInfo: getContextInfo() });
      } 
      else if (type === 'videoMessage') {
        const buffer = await downloadMedia(content, 'video');
        await ctx.send({ video: buffer, caption, contextInfo: getContextInfo() });
      } 
      else if (type === 'audioMessage') {
        const buffer = await downloadMedia(content, 'audio');
        await ctx.send({ 
            audio: buffer, 
            mimetype: 'audio/ogg; codecs=opus', 
            ptt: true, 
            contextInfo: getContextInfo() 
        });
      } 
      else if (type === 'conversation' || type === 'extendedTextMessage') {
        const text = content.text || content;
        await ctx.send({ 
            text: `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*\n┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷\n┇◆┋🔓 *VIEW-ONCE TEXT*\n┇◆┋\n┇◆┋${text}\n┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷\n╰═══════════════════⍟`, 
            contextInfo: getContextInfo() 
        });
      } 
      else {
        return ctx.reply(`> ❌ *Unsupported view-once type.*`);
      }

      logger.success(`[VV] View-once ${type} recovered successfully.`);
      await ctx.react('✅');

    } catch (err) {
      logger.error(`[VV] Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Error:* ${err.message}`);
    }
  }
};
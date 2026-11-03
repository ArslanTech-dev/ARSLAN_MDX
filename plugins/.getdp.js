/**
 * ═══════════════════════════════════════════════════════════════════
 * 📸 GETDP.JS — Smart Profile Picture Downloader
 * ═══════════════════════════════════════════════════════════════════
 * Fetches DP, checks if number exists, and falls back to Status.
 */

import logger from '../utils/logger.js';

// 🚀 View Channel Context
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

export const getdp = {
  name: 'getdp',
  aliases: ['dp', 'profilepic', 'getpp'],
  async run(ctx) {
    let target = ctx.args[0];
    
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target && mentioned) target = mentioned;
    if (!target) target = ctx.sender;

    const cleanNum = target.replace(/\D/g, '');
    
    if (!cleanNum || cleanNum.length < 10) {
      return ctx.reply(`> ❌ *Please provide a valid phone number.*\n> Example: ${ctx.prefix}getdp 923001234567`);
    }

    const jid = `${cleanNum}@s.whatsapp.net`;
    await ctx.react('📸');

    try {
      // 🚀 1. Check if the number is actually on WhatsApp
      const [result] = await ctx.sock.onWhatsApp(jid);
      
      if (!result || !result.exists) {
        await ctx.react('❌');
        return ctx.reply(`> ❌ *Number +${cleanNum} is not registered on WhatsApp.*`);
      }

      // 🚀 2. Try to fetch Profile Picture
      let ppUrl = null;
      try {
        ppUrl = await ctx.sock.profilePictureUrl(jid, 'image');
      } catch (e) {
        // DP hidden or not set, we will catch this and fallback
      }

      if (ppUrl) {
        // ✅ DP Found
        const caption = `> *Profile Pic Downloaded*
> *Successfully* ✅

*User:* ${cleanNum}

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

        await ctx.send({
          image: { url: ppUrl },
          caption: caption,
          contextInfo: getContextInfo()
        });
      } else {
        // ⚠️ DP Hidden: Fallback to fetching Status (About)
        let statusText = 'Hidden / Not Set';
        try {
          const status = await ctx.sock.fetchStatus(jid);
          if (status && status.status) statusText = status.status;
        } catch (e) {
          // Status is also hidden
        }

        const fallbackCaption = `> ⚠️ *Profile Pic Hidden*
> The user has restricted their DP via privacy settings.

*User:* ${cleanNum}
*Status/About:* ${statusText}

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

        await ctx.send({ text: fallbackCaption, contextInfo: getContextInfo() });
      }

      await ctx.react('✅');
      
    } catch (error) {
      await ctx.react('❌');
      logger.error(`[GETDP] Error: ${error.message}`);
      ctx.reply(`> ❌ *Error:* ${error.message}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`);
    }
  }
};
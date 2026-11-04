/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Reactions (Simple & Clean)
 * ═══════════════════════════════════════════════════════════════════
 */

import logger from '../utils/logger.js';

// 🚀 View Channel Context (Optional, for the forwarded tag)
const getContextInfo = () => {
  return {
    forwardingScore: 999,
    isForwarded: false,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363412450457588@newsletter', 
      newsletterName: 'ARSLAN MDX',
      serverMessageId: 143
    }
  };
};

export const kiss = {
  name: 'kiss',
  aliases: ['animekiss', 'kissgif'],
  async run(ctx) {
    await ctx.react('💋');
    
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned ? `@${mentioned.split('@')[0]}` : `@${ctx.senderNumber}`;

    let gifUrl = null;

    // 🚀 1. Try Nekos.best API
    try {
      const res = await fetch('https://nekos.best/api/v2/kiss', {
        signal: AbortSignal.timeout(8000)
      });
      const data = await res.json();
      if (data.results && data.results[0]?.url) {
        gifUrl = data.results[0].url;
      }
    } catch (e) {
      logger.warn(`[ANIME] Nekos.best failed: ${e.message}`);
    }

    // 🚀 2. Fallback to Waifu.pics
    if (!gifUrl) {
      try {
        const res = await fetch('https://api.waifu.pics/sfw/kiss', {
          signal: AbortSignal.timeout(8000)
        });
        const data = await res.json();
        if (data.url) {
          gifUrl = data.url;
        }
      } catch (e) {
        logger.warn(`[ANIME] Waifu.pics failed: ${e.message}`);
      }
    }

    if (!gifUrl) {
      await ctx.react('❌');
      return ctx.reply(`❌ Failed to fetch GIF. Try again.`);
    }

    // 🎨 SIMPLE CAPTION (As requested)
    const caption = `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`;

    await ctx.send({
      video: { url: gifUrl },
      gifPlayback: true, // Makes the video play as a GIF
      caption: caption,
      mentions: mentioned ? [mentioned] : [ctx.sender],
      contextInfo: getContextInfo()
    });

    await ctx.react('✅');
  }
};
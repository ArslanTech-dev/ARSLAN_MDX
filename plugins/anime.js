/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Kiss (Direct MP4)
 * ═══════════════════════════════════════════════════════════════════
 * Uses Tenor API to get direct MP4 URLs for guaranteed playback.
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

export const kiss = {
  name: 'kiss',
  aliases: ['animekiss', 'kissgif'],
  async run(ctx) {
    await ctx.react('💋');
    
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    
    let mp4Url = null;

    // 🚀 1. Fetch direct MP4 from Tenor API
    try {
      const res = await fetch(`https://g.tenor.com/v1/search?q=anime+kiss&key=LIVDSRZULELA&limit=1&media_filter=minimal`, {
        signal: AbortSignal.timeout(10000)
      });
      const data = await res.json();
      
      // Tenor returns an array of results
      if (data.results && data.results.length > 0) {
        // Extract the MP4 url
        mp4Url = data.results[0].media[0].mp4.url;
      }
    } catch (e) {
      logger.warn(`[ANIME] Tenor API failed: ${e.message}`);
    }

    // 🚀 2. Fallback (Agar Tenor fail ho jaye toh waifu.pics ka use karein)
    if (!mp4Url) {
      try {
        const res = await fetch('https://api.waifu.pics/sfw/kiss', {
          signal: AbortSignal.timeout(8000)
        });
        const data = await res.json();
        if (data.url) {
            // Note: Waifu.pics returns gif, but WhatsApp might still try to play it
            mp4Url = data.url; 
        }
      } catch (e) {
        logger.warn(`[ANIME] Waifu.pics fallback failed: ${e.message}`);
      }
    }

    if (!mp4Url) {
      await ctx.react('❌');
      return ctx.reply(`❌ Failed to fetch GIF. Try again.`);
    }

    try {
      // 🎨 Simple Caption
      const caption = `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`;

      // 🚀 3. Send as Video with gifPlayback
      await ctx.send({
        video: { url: mp4Url },
        mimetype: 'video/mp4', // Force MP4 mimetype
        gifPlayback: true,
        caption: caption,
        mentions: mentioned ? [mentioned] : [ctx.sender],
        contextInfo: getContextInfo()
      });

      await ctx.react('✅');
      
    } catch (err) {
      logger.error(`[ANIME] Send Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`❌ Failed to send GIF.`);
    }
  }
};
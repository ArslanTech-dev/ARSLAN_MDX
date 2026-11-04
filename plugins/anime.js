/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Reactions (Buffer Method)
 * ═══════════════════════════════════════════════════════════════════
 */

import logger from '../utils/logger.js';

// 🚀 View Channel Context
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
    
    let gifUrl = null;

    // 🚀 1. API Fetch (Waifu.pics is very reliable for direct GIFs)
    try {
      const res = await fetch('https://api.waifu.pics/sfw/kiss', {
        signal: AbortSignal.timeout(10000)
      });
      const data = await res.json();
      if (data.url) gifUrl = data.url;
    } catch (e) {
      logger.warn(`[ANIME] Waifu.pics failed: ${e.message}`);
    }

    // Fallback API
    if (!gifUrl) {
      try {
        const res = await fetch('https://nekos.best/api/v2/kiss', {
          signal: AbortSignal.timeout(10000)
        });
        const data = await res.json();
        if (data.results && data.results[0]?.url) gifUrl = data.results[0].url;
      } catch (e) {
        logger.warn(`[ANIME] Nekos.best failed: ${e.message}`);
      }
    }

    if (!gifUrl) {
      await ctx.react('❌');
      return ctx.reply(`❌ Failed to fetch GIF. Try again.`);
    }

    try {
      // 🚀 2. Download GIF as Buffer (Fixes playback issue)
      const mediaRes = await fetch(gifUrl);
      const buffer = Buffer.from(await mediaRes.arrayBuffer());

      // 🎨 Simple Caption
      const caption = `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`;

      // 🚀 3. Send as Video Buffer with GIF playback
      await ctx.send({
        video: buffer,
        gifPlayback: true,
        caption: caption,
        mentions: mentioned ? [mentioned] : [ctx.sender],
        contextInfo: getContextInfo()
      });

      await ctx.react('✅');
    } catch (err) {
      logger.error(`[ANIME] Send Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`❌ Failed to play GIF.`);
    }
  }
};
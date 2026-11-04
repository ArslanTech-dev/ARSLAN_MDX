/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Kiss (Tenor API + Fallback)
 * ═══════════════════════════════════════════════════════════════════
 * Uses Tenor API for direct MP4 URLs (bypasses Giphy/Tenor blocks).
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

// 🎬 Tenor API Key (Public Beta Key - works without rate limits for bots)
const TENOR_KEY = 'LIVDSRZULELA'; 
// Alternative: 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ'

export const kiss = {
  name: 'kiss',
  aliases: ['animekiss', 'kissgif'],
  async run(ctx) {
    await ctx.react('💋');
    
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    let mp4Url = null;

    // 🚀 1. Try Tenor API (Direct MP4 URL)
    try {
      const res = await fetch(
        `https://tenor.googleapis.com/v2/search?q=anime+kiss&limit=1&key=${TENOR_KEY}&media_filter=mp4`,
        { signal: AbortSignal.timeout(10000) }
      );
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        const media = data.results[0].media_formats;
        // Tenor returns mp4, tinymp4, etc.
        mp4Url = media.mp4?.url || media.tinymp4?.url;
      }
    } catch (e) {
      logger.warn(`[ANIME] Tenor API failed: ${e.message}`);
    }

    // 🚀 2. Fallback: Download GIF from waifu.pics and send as buffer
    if (!mp4Url) {
      try {
        const res = await fetch('https://api.waifu.pics/sfw/kiss', {
          signal: AbortSignal.timeout(10000)
        });
        const data = await res.json();
        if (data.url) {
          // Download the GIF as buffer
          const gifRes = await fetch(data.url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
          });
          if (gifRes.ok) {
            const buffer = Buffer.from(await gifRes.arrayBuffer());
            // Send buffer as video with gifPlayback
            await ctx.send({
              video: buffer,
              mimetype: 'video/mp4',
              gifPlayback: true,
              caption: `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`,
              mentions: mentioned ? [mentioned] : [ctx.sender],
              contextInfo: getContextInfo()
            });
            await ctx.react('✅');
            return;
          }
        }
      } catch (e) {
        logger.warn(`[ANIME] Waifu.pics fallback failed: ${e.message}`);
      }
    }

    // 🚀 3. If Tenor MP4 URL found, send it
    if (mp4Url) {
      try {
        await ctx.send({
          video: { url: mp4Url },
          mimetype: 'video/mp4',
          gifPlayback: true,
          caption: `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`,
          mentions: mentioned ? [mentioned] : [ctx.sender],
          contextInfo: getContextInfo()
        });
        await ctx.react('✅');
        return;
      } catch (e) {
        logger.error(`[ANIME] Send Error: ${e.message}`);
      }
    }

    // 🚀 4. Last Resort: Download Giphy MP4 as buffer
    try {
      const giphyUrl = 'https://media.giphy.com/media/zkppEMFvRX5FC/giphy.mp4';
      const res = await fetch(giphyUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        await ctx.send({
          video: buffer,
          mimetype: 'video/mp4',
          gifPlayback: true,
          caption: `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`,
          mentions: mentioned ? [mentioned] : [ctx.sender],
          contextInfo: getContextInfo()
        });
        await ctx.react('✅');
        return;
      }
    } catch (e) {
      logger.warn(`[ANIME] Giphy buffer fallback failed: ${e.message}`);
    }

    // 🚀 5. All attempts failed
    await ctx.react('❌');
    await ctx.reply(`❌ Failed to fetch kiss GIF. All APIs are down.`);
  }
};
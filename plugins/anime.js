/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Kiss (Randomized Edition)
 * ═══════════════════════════════════════════════════════════════════
 * Fetches multiple results and picks a random one for variety.
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

const TENOR_KEY = 'LIVDSRZULELA';

// Fallback Giphy MP4 links (multiple)
const fallbackGifs = [
  'https://media.giphy.com/media/zkppEMFvRX5FC/giphy.mp4',
  'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.mp4',
  'https://media.giphy.com/media/12VXIxKaIEarL2/giphy.mp4',
  'https://media.giphy.com/media/xUySTCDX1GZk8jO5sY/giphy.mp4',
  'https://media.giphy.com/media/3ohs4BSacFKI7A717y/giphy.mp4'
];

export const kiss = {
  name: 'kiss',
  aliases: ['animekiss', 'kissgif'],
  async run(ctx) {
    await ctx.react('💋');
    
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    let mp4Url = null;

    // 🚀 1. Try Tenor API (Fetch multiple & pick random)
    try {
      const res = await fetch(
        `https://tenor.googleapis.com/v2/search?q=anime+kiss&limit=50&key=${TENOR_KEY}&media_filter=mp4`,
        { signal: AbortSignal.timeout(10000) }
      );
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        // Pick a random result from the array
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const media = data.results[randomIndex].media_formats;
        mp4Url = media.mp4?.url || media.tinymp4?.url;
      }
    } catch (e) {
      logger.warn(`[ANIME] Tenor API failed: ${e.message}`);
    }

    // 🚀 2. Fallback: Buffer from Giphy (Random from array)
    if (!mp4Url) {
      try {
        const randomGif = fallbackGifs[Math.floor(Math.random() * fallbackGifs.length)];
        const res = await fetch(randomGif, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
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
        logger.warn(`[ANIME] Giphy fallback failed: ${e.message}`);
      }
    }

    // 🚀 3. Send Tenor MP4 URL if found
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

    // 🚀 4. Last Resort: Waifu.pics (Random GIF buffer)
    try {
        const res = await fetch('https://api.waifu.pics/sfw/kiss', {
          signal: AbortSignal.timeout(10000)
        });
        const data = await res.json();
        if (data.url) {
          const gifRes = await fetch(data.url);
          if (gifRes.ok) {
            const buffer = Buffer.from(await gifRes.arrayBuffer());
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
    } catch(e) {
        logger.warn(`[ANIME] Waifu.pics failed: ${e.message}`);
    }

    // 🚀 5. All attempts failed
    await ctx.react('❌');
    await ctx.reply(`❌ Failed to fetch kiss GIF. All APIs are down.`);
  }
};
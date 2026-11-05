/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Kiss (20+ Random Kiss GIFs)
 * ═══════════════════════════════════════════════════════════════════
 * Uses nekos.best API with amount=20 to fetch 20 kiss GIFs in one call.
 * Picks a random one each time.
 */

import axios from 'axios';
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

// 🚀 Fetch 20 Kiss GIF URLs from nekos.best
async function fetch20KissGifs() {
  const res = await axios.get('https://nekos.best/api/v2/kiss?amount=20', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    timeout: 15000
  });
  if (!res.data.results || res.data.results.length === 0) {
    throw new Error('No kiss GIFs returned from API');
  }
  // Extract URLs and remove duplicates (if any)
  const urls = [...new Set(res.data.results.map(item => item.url))];
  return urls;
}

export const kiss = {
  name: 'kiss',
  aliases: ['animekiss', 'kissgif'],
  async run(ctx) {
    await ctx.react('💋');
    logger.info(`[KISS] Command triggered by ${ctx.senderNumber}`);

    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;

    let gifUrls = [];
    try {
      // 🚀 1. Fetch 20 kiss GIFs
      gifUrls = await fetch20KissGifs();
      logger.info(`[KISS] Fetched ${gifUrls.length} kiss GIFs`);
    } catch (err) {
      logger.error(`[KISS] API failed: ${err.message}`);
      await ctx.react('❌');
      return ctx.reply(`❌ Failed to fetch kiss GIFs. Please try again.`);
    }

    // 🚀 2. Pick a random GIF from the list
    const randomIndex = Math.floor(Math.random() * gifUrls.length);
    const gifUrl = gifUrls[randomIndex];
    logger.info(`[KISS] Selected GIF #${randomIndex + 1}: ${gifUrl}`);

    try {
      // 🚀 3. Download GIF as buffer (with browser User-Agent to avoid blocks)
      const response = await axios.get(gifUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 15000
      });

      const buffer = Buffer.from(response.data, 'binary');
      if (buffer.length === 0) throw new Error('Empty buffer');

      // 🚀 4. Send as video with gifPlayback
      await ctx.send({
        video: buffer,
        mimetype: 'video/mp4',
        gifPlayback: true,
        caption: `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`,
        mentions: mentioned ? [mentioned] : [ctx.sender],
        contextInfo: getContextInfo()
      });

      logger.success(`[KISS] GIF sent successfully.`);
      await ctx.react('✅');

    } catch (err) {
      logger.error(`[KISS] Download/Send error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`❌ Failed to send GIF: ${err.message}`);
    }
  }
};
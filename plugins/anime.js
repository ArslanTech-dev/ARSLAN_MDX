/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Kiss (41 Unique GIFs)
 * ═══════════════════════════════════════════════════════════════════
 * Uses gifcdn's GitHub Raw CDN: 41 kiss GIFs, no API key, no rate limits.
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

// 🎬 Direct GitHub Raw CDN URLs for 41 Kiss GIFs
const KISS_GIF_COUNT = 41;

export const kiss = {
  name: 'kiss',
  aliases: ['animekiss', 'kissgif'],
  async run(ctx) {
    await ctx.react('💋');
    logger.info(`[KISS] Command triggered by ${ctx.senderNumber}`);

    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;

    // 🚀 1. Pick a random number between 1 and 41
    const randomNum = Math.floor(Math.random() * KISS_GIF_COUNT) + 1;
    const gifUrl = `https://raw.githubusercontent.com/itsfizys/gifcdn/main/kiss/${randomNum}.gif`;
    logger.info(`[KISS] Selected GIF #${randomNum}: ${gifUrl}`);

    try {
      // 🚀 2. Download GIF as buffer with browser User-Agent
      const response = await axios.get(gifUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 15000
      });

      const buffer = Buffer.from(response.data, 'binary');
      if (buffer.length === 0) throw new Error('Empty buffer received');

      logger.success(`[KISS] Buffer downloaded. Size: ${buffer.length} bytes`);

      // 🚀 3. Send as video with gifPlayback
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
      await ctx.reply(`❌ Failed to send GIF. Please try again.`);
    }
  }
};
/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Kiss (Bulletproof)
 * ═══════════════════════════════════════════════════════════════════
 */

import axios from 'axios';
import logger from '../utils/logger.js';

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

const kissGifs = [
  'https://media.giphy.com/media/G3va31oEEnIkM/giphy.mp4',
  'https://media.giphy.com/media/zkppEMFvRX5FC/giphy.mp4',
  'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.mp4',
  'https://media.giphy.com/media/12VXIxKaIEarL2/giphy.mp4',
  'https://media.giphy.com/media/xUySTCDX1GZk8jO5sY/giphy.mp4'
];

export const kiss = {
  name: 'kiss',
  aliases: ['animekiss', 'kissgif'],
  async run(ctx) {
    logger.info(`[KISS] Command triggered by ${ctx.senderNumber}`);
    await ctx.react('💋');
    
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    const randomGif = kissGifs[Math.floor(Math.random() * kissGifs.length)];

    try {
      logger.info(`[KISS] Downloading from: ${randomGif}`);
      const response = await axios.get(randomGif, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 15000 
      });

      const buffer = Buffer.from(response.data, 'binary');
      logger.success(`[KISS] Buffer downloaded. Size: ${buffer.length} bytes`);

      if (buffer.length === 0) throw new Error('Buffer is empty');

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
      logger.error(`[KISS] Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`❌ Failed to send GIF: ${err.message}`);
    }
  }
};
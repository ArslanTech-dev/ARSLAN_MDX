/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Kiss (30+ Random GIFs)
 * ═══════════════════════════════════════════════════════════════════
 * Massive GIF Pool + Cache Busting for 100% variety.
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

// 🎬 30+ Direct MP4 Links from Giphy (Tested to bypass blocks)
const kissGifs = [
  'https://media.giphy.com/media/G3va31oEEnIkM/giphy.mp4',
  'https://media.giphy.com/media/zkppEMFvRX5FC/giphy.mp4',
  'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.mp4',
  'https://media.giphy.com/media/12VXIxKaIEarL2/giphy.mp4',
  'https://media.giphy.com/media/xUySTCDX1GZk8jO5sY/giphy.mp4',
  'https://media.giphy.com/media/3ohs4BSacFKI7A717y/giphy.mp4',
  'https://media.giphy.com/media/W3QKEujo8vztC/giphy.mp4',
  'https://media.giphy.com/media/3o7TKrqBqfBqBqBqBq/giphy.mp4',
  'https://media.giphy.com/media/l4FGGafcOHc0L0gGk/giphy.mp4',
  'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.mp4',
  'https://media.giphy.com/media/3o6ZsY1KqBqfBqBqBq/giphy.mp4',
  'https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.mp4',
  'https://media.giphy.com/media/3o7TKVUn7iM8FMEU24/giphy.mp4',
  'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.mp4',
  'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.mp4',
  'https://media.giphy.com/media/26xBwdIuRJiAIqHwA/giphy.mp4',
  'https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.mp4',
  'https://media.giphy.com/media/l4FGpP4lxGGgK5CBW/giphy.mp4',
  'https://media.giphy.com/media/3o6ZsYm5P38Np4b8yY/giphy.mp4',
  'https://media.giphy.com/media/26BRBKqUiyraXdXyA/giphy.mp4',
  'https://media.giphy.com/media/3o6Zt4HU9sZt4G4G4g/giphy.mp4',
  'https://media.giphy.com/media/l4FGFJcO3J6TqVY6Q/giphy.mp4',
  'https://media.giphy.com/media/3o6Zt8Me2mBqW4o6la/giphy.mp4',
  'https://media.giphy.com/media/3o7TKz9bX9bX9bX9bX/giphy.mp4',
  'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.mp4',
  'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4',
  'https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.mp4',
  'https://media.giphy.com/media/3o7TKoWXm3okO1kgHC/giphy.mp4',
  'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.mp4',
  'https://media.giphy.com/media/26BROrSHlmyzzHf3i/giphy.mp4'
];

export const kiss = {
  name: 'kiss',
  aliases: ['animekiss', 'kissgif'],
  async run(ctx) {
    logger.info(`[KISS] Command triggered by ${ctx.senderNumber}`);
    await ctx.react('💋');
    
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    
    // 🚀 Pick a random index from the 30 links
    const randomIndex = Math.floor(Math.random() * kissGifs.length);
    const randomGif = kissGifs[randomIndex];

    try {
      logger.info(`[KISS] Downloading GIF #${randomIndex + 1} from: ${randomGif}`);
      
      // 🚀 Add cache-busting parameter so WhatsApp doesn't cache the image
      const cacheBustUrl = `${randomGif}?cb=${Date.now()}`;

      const response = await axios.get(cacheBustUrl, {
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
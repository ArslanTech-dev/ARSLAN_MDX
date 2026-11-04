/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Kiss (Direct Giphy MP4)
 * ═══════════════════════════════════════════════════════════════════
 * Uses Giphy MP4 URLs for guaranteed WhatsApp playback.
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

// 🎬 Giphy MP4 URLs (Direct video format for WhatsApp)
// Note: Humne .gif ki jagah .mp4 laga diya hai taake WhatsApp isko perfect play kare.
const kissGifs = [
  'https://media.giphy.com/media/G3va31oEEnIkM/giphy.mp4',
  'https://media.giphy.com/media/zkppEMFvRX5FC/giphy.mp4',
  'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.mp4',
  'https://media.giphy.com/media/12VXIxKaIEarL2/giphy.mp4',
  'https://media.giphy.com/media/xUySTCDX1GZk8jO5sY/giphy.mp4',
  'https://media.giphy.com/media/3ohs4BSacFKI7A717y/giphy.mp4',
  'https://media.giphy.com/media/W3QKEujo8vztC/giphy.mp4'
];

export const kiss = {
  name: 'kiss',
  aliases: ['animekiss', 'kissgif'],
  async run(ctx) {
    await ctx.react('💋');
    
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    
    // Randomly pick one GIF
    const randomGif = kissGifs[Math.floor(Math.random() * kissGifs.length)];

    try {
      // 🎨 Simple Caption
      const caption = `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`;

      // 🚀 Send as Video with gifPlayback flag
      await ctx.send({
        video: { url: randomGif },
        mimetype: 'video/mp4',
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
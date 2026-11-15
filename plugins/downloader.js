/**
 * ═══════════════════════════════════════════════════════════════════
 * 📥 DOWNLOADER.JS — Play Command (Premium Design)
 * ═══════════════════════════════════════════════════════════════════
 */

import { downloadYouTubeAudio } from '../lib/ytmusic.js';
import logger from '../utils/logger.js';

const randomSongs = [
  'Admirin You Karan Aujla', 'Kesariya Brahmastra', 'Tum Hi Ho Aashiqui 2',
  'Apna Bana Le Bhediya', 'Heeriye Jasleen Royal', 'Cheques Shubh'
];

export const play = {
  name: 'play',
  aliases: ['song', 'music', 'audio', 'ytmp3'],
  async run(ctx) {
    let query = ctx.args.join(' ').trim();
    
    if (!query) {
      query = randomSongs[Math.floor(Math.random() * randomSongs.length)];
      await ctx.reply(`> 🎲 *Random Song:* \`${query}\``);
    }

    await ctx.react('⏳');

    try {
      const result = await downloadYouTubeAudio(query);

      // 🎨 1. Thumbnail + Caption bhejo (Agar available ho)
      if (result.thumbnailBuffer) {
          const captionText = `> 🎵 *${result.title}*\n` +
                              `> ────────────────\n` +
                              `> 👤 \`Author : ${result.author}\`\n` +
                              `> ⏱️ \`Duration: ${result.duration}\`\n` +
                              `> ────────────────\n` +
                              `> ⬇️ _Downloading Audio..._`;
          
          await ctx.send({
              image: result.thumbnailBuffer,
              caption: captionText
          });
      }

      // 🎧 2. Audio bhejo
      await ctx.send({
          audio: result.audioBuffer,
          mimetype: result.mimetype,
          fileName: result.fileName,
          ptt: false,
      });

      await ctx.react('✅');

    } catch (err) {
      logger.error(`[PLAY] Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Download Failed*\n> ╰─➤ ${err.message}\n\n> © POWERED BY ARSLAN MD`);
    }
  },
};
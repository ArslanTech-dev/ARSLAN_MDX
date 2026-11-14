/**
 * ═══════════════════════════════════════════════════════════════════
 * 📥 DOWNLOADER.JS — ARSLAN MDX Downloader Commands
 * ═══════════════════════════════════════════════════════════════════
 */

import { downloadYouTubeAudio } from '../lib/ytmusic.js';
import logger from '../utils/logger.js';

// 🎲 Random Songs
const randomSongs = [
  'Admirin You Karan Aujla',
  'Kesariya Brahmastra',
  'Tum Hi Ho Aashiqui 2',
  'Apna Bana Le Bhediya',
  'Heeriye Jasleen Royal',
  'Cheques Shubh',
  'Excuses AP Dhillon',
  'Mi Amor Sharn',
  'Lover Talwinder'
];

export const play = {
  name: 'play',
  aliases: ['song', 'music', 'ytmp3'],
  async run(ctx) {
    let query = ctx.args.join(' ');

    // 🎲 Random pick
    if (!query) {
      query = randomSongs[Math.floor(Math.random() * randomSongs.length)];
      await ctx.reply(`> 🎲 *Random Song Selected*\n> ╰─➤ Searching: \`${query}\``);
    }

    await ctx.react('⏳');

    try {
      // 🚀 Download audio via lib function
      const { title, author, duration, views, audioUrl } = await downloadYouTubeAudio(query);

      await ctx.react('✅');

      // 🎨 Caption Design
      const caption = `> 🎧 *AUDIO DOWNLOADED*\n` +
        `> ────────────────\n` +
        `> 🎵 \`Title    : ${title || 'Unknown'}\`\n` +
        `> ⏱️ \`Duration : ${duration || 'Unknown'}\`\n` +
        `> 👀 \`Views    : ${views || 'N/A'}\`\n` +
        `> 📺 \`Author   : ${author || 'Unknown'}\`\n` +
        `> ────────────────\n` +
        `> 💫 _POWERED BY ARSLAN MD_ 💫`;

      // 🚀 1. Audio send karo (bina caption ke)
      const audioMsg = await ctx.send({
        audio: { url: audioUrl },
        mimetype: 'audio/mp4',
        fileName: `${title || 'audio'}.mp3`,
      });

      // 🚀 2. Audio ko reply karke Caption send karo
      await ctx.send({ text: caption }, { quoted: audioMsg });

    } catch (err) {
      logger.error(`[PLAY] Failed: ${err.message}`);
      await ctx.react('❌');
      
      await ctx.reply(`> ❌ *Download Failed*\n> ╰─➤ Reason: ${err.message}\n> ╰─➤ Please try again later.\n\n> © POWERED BY ARSLAN MD`);
    }
  },
};
import { downloadYouTubeAudio } from '../lib/ytmusic.js';
import logger from '../utils/logger.js';

const randomSongs = [
  'Admirin You Karan Aujla', 'Kesariya Brahmastra', 'Tum Hi Ho Aashiqui 2',
  'Apna Bana Le Bhediya', 'Heeriye Jasleen Royal', 'Cheques Shubh',
  'Excuses AP Dhillon', 'Mi Amor Sharn', 'Lover Talwinder'
];

export const play = {
  name: 'play',
  aliases: ['song', 'music', 'ytmp3'],
  async run(ctx) {
    // 1. Turant reply taake user ko pata chale bot zinda hai
    let waitMsg;
    try {
      waitMsg = await ctx.reply(`> ⏳ *Processing request...*\n> ╰─➤ Please wait up to 30s.`);
      await ctx.react('⏳');
    } catch (e) {
      logger.error(`[PLAY] Failed to send wait message: ${e.message}`);
    }

    try {
      let query = ctx.args.join(' ').trim();
      if (!query) {
        query = randomSongs[Math.floor(Math.random() * randomSongs.length)];
      }

      logger.info(`[PLAY] Requested: ${query}`);

      // 🚀 Download logic
      const result = await downloadYouTubeAudio(query);

      await ctx.react('✅');

      const caption = `> 🎧 *AUDIO DOWNLOADED*\n` +
        `> ────────────────\n` +
        `> 🎵 \`Title  : ${result.title}\`\n` +
        `> 📺 \`Source : YouTube\`\n` +
        `> ────────────────\n` +
        `> 💫 _POWERED BY ARSLAN MD_ 💫`;

      // Audio send karo
      const audioMsg = await ctx.send({
        audio: { url: result.audioUrl },
        mimetype: 'audio/mp4',
        fileName: `${result.title || 'audio'}.mp3`,
      });

      // Caption reply karo
      await ctx.send({ text: caption }, { quoted: audioMsg });

      // Wait message delete kar do
      if (waitMsg && waitMsg.key) {
         await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});
      }

    } catch (err) {
      logger.error(`[PLAY] Error: ${err.message}`);
      await ctx.react('❌');
      
      // Wait message delete karo
      if (waitMsg && waitMsg.key) {
         await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});
      }

      await ctx.reply(`> ❌ *Download Failed*\n> ╰─➤ ${err.message}\n\n> © POWERED BY ARSLAN MD`);
    }
  },
};
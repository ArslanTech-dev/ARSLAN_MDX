import { downloadYouTubeAudio } from '../lib/ytmusic.js';
import logger from '../utils/logger.js';
import fs from 'fs';

const randomSongs = [
  'Admirin You Karan Aujla', 'Kesariya Brahmastra', 'Tum Hi Ho Aashiqui 2',
  'Apna Bana Le Bhediya', 'Heeriye Jasleen Royal', 'Cheques Shubh',
  'Excuses AP Dhillon', 'Mi Amor Sharn', 'Lover Talwinder'
];

export const play = {
  name: 'play',
  aliases: ['song', 'music', 'ytmp3'],
  async run(ctx) {
    let waitMsg;
    try {
      waitMsg = await ctx.reply(`> ⏳ *Downloading Audio...*\n> ╰─➤ Please wait up to 30s.`);
      await ctx.react('⏳');
    } catch (e) {}

    let filePath = null;
    try {
      let query = ctx.args.join(' ').trim();
      if (!query) {
        query = randomSongs[Math.floor(Math.random() * randomSongs.length)];
      }

      logger.info(`[PLAY] Requested: ${query}`);
      
      // Download trigger karo
      const result = await downloadYouTubeAudio(query);

      await ctx.react('✅');

      const caption = `> 🎧 *AUDIO DOWNLOADED*\n` +
        `> ────────────────\n` +
        `> 🎵 \`Title  : ${result.title}\`\n` +
        `> ⏱️ \`Duration: ${result.duration}\`\n` +
        `> 📺 \`Author : ${result.author}\`\n` +
        `> ────────────────\n` +
        `> 💫 _POWERED BY ARSLAN MD_ 💫`;

      let audioPayload;
      
      // Agar direct file hai toh Buffer banao, warna URL use karo
      if (result.isUrl) {
          audioPayload = { url: result.audioUrl };
      } else {
          filePath = result.filePath;
          audioPayload = fs.readFileSync(filePath);
      }

      // Audio send karo
      const audioMsg = await ctx.send({
        audio: audioPayload,
        mimetype: 'audio/mp4',
        fileName: `${result.title || 'audio'}.mp3`,
      });

      // Caption reply karo
      await ctx.send({ text: caption }, { quoted: audioMsg });

    } catch (err) {
      logger.error(`[PLAY] Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Download Failed*\n> ╰─➤ ${err.message}\n\n> © POWERED BY ARSLAN MD`);
    } finally {
      // Wait message delete karo
      if (waitMsg && waitMsg.key) {
         await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});
      }
      // Temp file delete karo (Storage full na ho)
      if (filePath && fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch {}
      }
    }
  },
};
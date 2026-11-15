import { downloadYouTubeAudio } from '../lib/ytmusic.js';
import logger from '../utils/logger.js';

export const play = {
  name: 'play',
  aliases: ['song', 'music', 'audio', 'ytmp3'],
  async run(ctx) {
    let query = ctx.args.join(' ').trim();
    
    if (!query) {
        return ctx.reply('> ❌ Please provide a song name.\n> Example: `.play Kesariya`');
    }

    // 🚨 Turant reply taake user ko pata chale bot zinda hai
    let waitMsg;
    try {
        waitMsg = await ctx.reply(`> ⏳ *Downloading...*\n> ╰─➤ \`${query}\`\n> _Please wait up to 30s..._`);
    } catch (e) {}

    try {
      const result = await downloadYouTubeAudio(query);

      // Wait message delete karo
      if (waitMsg) {
          await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});
      }

      // 🎨 1. Thumbnail bhejo
      if (result.thumbnail) {
          await ctx.send({
              image: { url: result.thumbnail },
              caption: `> 🎵 *${result.title}*\n> 👤 \`Author : ${result.author}\`\n\n> ⬇️ _Sending Audio..._`
          });
      }

      // 🎧 2. Audio URL bhejo (Buffer download nahi karenge taake memory full na ho)
      await ctx.send({
          audio: { url: result.audioUrl },
          mimetype: 'audio/mp4',
          fileName: `${result.title}.mp3`
      });
      
      await ctx.react('✅');

    } catch (err) {
      if (waitMsg) {
          await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});
      }
      logger.error(`[PLAY] Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Download Failed*\n> ╰─➤ ${err.message}\n\n> © POWERED BY ARSLAN MD`);
    }
  }
}
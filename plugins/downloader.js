/**
 * ═══════════════════════════════════════════════════════════════════
 * 📥 DOWNLOADER.JS — Play Command (Spotify Version)
 * ═══════════════════════════════════════════════════════════════════
 */

import { downloadSpotifyAudio } from '../lib/spotify.js';
import logger from '../utils/logger.js';

const randomSongs = [
  'Kesariya', 'Apna Bana Le', 'Heeriye', 'Cheques', 'Excuses', 
  'Mi Amor', 'Tum Hi Ho', 'Admirin You', 'Lover'
];

export const play = {
  name: 'play',
  aliases: ['song', 'music', 'spotify'],
  async run(ctx) {
    let query = ctx.args.join(' ').trim();
    
    if (!query) {
        query = randomSongs[Math.floor(Math.random() * randomSongs.length)];
    }

    // Turant reply taake user ko pata chale bot zinda hai
    let waitMsg;
    try {
        waitMsg = await ctx.reply(`> ⏳ *Spotify Search...*\n> ╰─➤ \`${query}\`\n> _Please wait..._`);
        await ctx.react('⏳');
    } catch (e) {}

    try {
      const result = await downloadSpotifyAudio(query);

      // Wait message delete karo
      if (waitMsg && waitMsg.key) {
          await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});
      }

      // 🎨 1. Thumbnail bhejo (Agar mila ho)
      if (result.thumbnail) {
          await ctx.send({
              image: { url: result.thumbnail },
              caption: `> 🟢 *SPOTIFY MUSIC*\n` +
                       `> ────────────────\n` +
                       `> 🎵 \`Title  : ${result.title}\`\n` +
                       `> 👤 \`Artist : ${result.artist}\`\n` +
                       `> ────────────────\n` +
                       `> ⬇️ _Sending Audio..._`
          });
      }

      // 🎧 2. Audio bhejo
      await ctx.send({
          audio: { url: result.audioUrl },
          mimetype: 'audio/mp4',
          fileName: `${result.title} - ${result.artist}.mp3`
      });
      
      await ctx.react('✅');

    } catch (err) {
      if (waitMsg && waitMsg.key) {
          await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});
      }
      logger.error(`[PLAY] Spotify Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Download Failed*\n> ╰─➤ ${err.message}\n\n> © POWERED BY ARSLAN MD`);
    }
  },
};
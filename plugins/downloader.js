/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎵 DOWNLOADER.js — ARSLAN MDX · .play (single command version)
 * Isko plugins/downloader.js ke naam se rakho (agar tumhari file mein sirf play hai).
 * Lib: lib/ytmusic.js (v3 — ytdl-core + yt-dlp + APIs)
 * ═══════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
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
        waitMsg = await ctx.reply(`> ⏳ *Downloading...*\n> ╰─➤ \`${query}\`\n> _Please wait up to 60s..._`);
    } catch (e) {}

    let result;
    try {
      result = await downloadYouTubeAudio(query);

      // Wait message delete karo
      if (waitMsg) {
          await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});
      }

      // 🎨 1. Thumbnail bhejo (fail ho to bhi audio bhejna hai)
      if (result.thumbnail) {
          try {
              await ctx.send({
                  image: { url: result.thumbnail },
                  caption: `> 🎵 *${result.title}*\n> 👤 \`Author : ${result.author}\`\n> ⏱️ \`Duration : ${result.duration}\`\n\n> ⬇️ _Sending Audio..._`
              });
          } catch (e) {
              logger.warn(`[PLAY] thumbnail failed: ${e.message}`);
          }
      }

      // 🎧 2. Audio bhejo (local file se; 16MB+ ho to document)
      const buffer = fs.readFileSync(result.filePath);
      if (result.asDocument) {
          await ctx.send({ document: buffer, mimetype: result.mimetype, fileName: result.fileName });
      } else {
          await ctx.send({ audio: buffer, mimetype: result.mimetype, fileName: result.fileName });
      }

      await ctx.react('✅');

    } catch (err) {
      if (waitMsg) {
          await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});
      }
      logger.error(`[PLAY] Error: ${err.message}${err.details ? ' | ' + err.details.join(' || ') : ''}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Download Failed*\n> ╰─➤ ${err.message}\n\n> © POWERED BY ARSLAN MD`);
    } finally {
      result?.cleanup?.(); // temp mp3 turant delete
    }
  }
}

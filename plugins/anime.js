/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Reactions (MP4 Converter)
 * ═══════════════════════════════════════════════════════════════════
 */

import fs from 'fs-extra';
import path from 'path';
import { Readable } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import logger from '../utils/logger.js';

// 🚀 Set FFmpeg Path
ffmpeg.setFfmpegPath(ffmpegPath);

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

// 🚀 Helper: Convert GIF Buffer to MP4 Buffer
const convertGifToMp4 = (gifBuffer) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        const stream = Readable.from(gifBuffer);

        ffmpeg(stream)
            .outputFormat('mp4')
            .videoCodec('libx264') // Best codec for WhatsApp
            .on('data', (chunk) => chunks.push(chunk))
            .on('end', () => resolve(Buffer.concat(chunks)))
            .on('error', (err) => reject(err))
            .run();
    });
};

export const kiss = {
  name: 'kiss',
  aliases: ['animekiss', 'kissgif'],
  async run(ctx) {
    await ctx.react('💋');
    
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    
    let gifUrl = null;

    // 1. API Fetch
    try {
      const res = await fetch('https://api.waifu.pics/sfw/kiss', {
        signal: AbortSignal.timeout(10000)
      });
      const data = await res.json();
      if (data.url) gifUrl = data.url;
    } catch (e) {
      logger.warn(`[ANIME] Waifu.pics failed: ${e.message}`);
    }

    if (!gifUrl) {
      await ctx.react('❌');
      return ctx.reply(`❌ Failed to fetch GIF. Try again.`);
    }

    try {
      // 2. Download GIF
      const mediaRes = await fetch(gifUrl);
      const gifBuffer = Buffer.from(await mediaRes.arrayBuffer());

      // 3. Convert GIF to MP4
      const mp4Buffer = await convertGifToMp4(gifBuffer);

      // 🎨 Simple Caption
      const caption = `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`;

      // 4. Send as Video
      await ctx.send({
        video: mp4Buffer,
        gifPlayback: true,
        caption: caption,
        mentions: mentioned ? [mentioned] : [ctx.sender],
        contextInfo: getContextInfo()
      });

      await ctx.react('✅');
      
    } catch (err) {
      logger.error(`[ANIME] Conversion/Send Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`❌ Failed to process GIF.`);
    }
  }
};
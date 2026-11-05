/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Kiss (Nekos.best + FFmpeg)
 * ═══════════════════════════════════════════════════════════════════
 * Cloud-friendly API + GIF to MP4 conversion for perfect playback.
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
    isForwarded: false,
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
            .videoCodec('libx264')
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
    let gifBuffer = null;

    // 🚀 1. Fetch GIF from Nekos.best (Cloud-friendly, no-key)
    try {
      const res = await fetch('https://nekos.best/api/v2/kiss', {
        signal: AbortSignal.timeout(10000)
      });
      const data = await res.json();
      
      if (data.results && data.results[0]?.url) {
        const gifUrl = data.results[0].url;
        // Download the GIF
        const gifRes = await fetch(gifUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        if (gifRes.ok) {
          gifBuffer = Buffer.from(await gifRes.arrayBuffer());
        }
      }
    } catch (e) {
      logger.warn(`[ANIME] Nekos.best failed: ${e.message}`);
    }

    // 🚀 2. Fallback: Try Waifu.pics
    if (!gifBuffer) {
      try {
        const res = await fetch('https://api.waifu.pics/sfw/kiss', {
          signal: AbortSignal.timeout(10000)
        });
        const data = await res.json();
        if (data.url) {
          const gifRes = await fetch(data.url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
          });
          if (gifRes.ok) {
            gifBuffer = Buffer.from(await gifRes.arrayBuffer());
          }
        }
      } catch (e) {
        logger.warn(`[ANIME] Waifu.pics failed: ${e.message}`);
      }
    }

    if (!gifBuffer) {
      await ctx.react('❌');
      return ctx.reply(`❌ Failed to fetch kiss GIF. Try again.`);
    }

    try {
      // 🚀 3. Convert GIF to MP4 (Best for WhatsApp playback)
      const mp4Buffer = await convertGifToMp4(gifBuffer);

      // 🎨 Simple Caption
      const caption = `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`;

      // 🚀 4. Send as Video
      await ctx.send({
        video: mp4Buffer,
        mimetype: 'video/mp4',
        gifPlayback: true,
        caption: caption,
        mentions: mentioned ? [mentioned] : [ctx.sender],
        contextInfo: getContextInfo()
      });

      await ctx.react('✅');
      
    } catch (err) {
      logger.error(`[ANIME] Conversion/Send Error: ${err.message}`);
      
      // 🚀 5. Last Resort: Send GIF buffer directly (WhatsApp may still play it)
      try {
        await ctx.send({
          video: gifBuffer,
          mimetype: 'video/mp4',
          gifPlayback: true,
          caption: `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`,
          mentions: mentioned ? [mentioned] : [ctx.sender],
          contextInfo: getContextInfo()
        });
        await ctx.react('✅');
      } catch (e) {
        await ctx.react('❌');
        await ctx.reply(`❌ Failed to process GIF.`);
      }
    }
  }
};
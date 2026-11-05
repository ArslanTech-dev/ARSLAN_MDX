/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Kiss (GIF to MP4 Conversion)
 * ═══════════════════════════════════════════════════════════════════
 */

import axios from 'axios';
import logger from '../utils/logger.js';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { exec } from 'child_process';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';

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

const KISS_GIF_COUNT = 41;

// 🚀 Helper: Convert GIF Buffer to MP4 using FFmpeg
const convertToMp4 = (gifBuffer) => {
  return new Promise((resolve, reject) => {
    // Create temp files
    const tempId = Date.now() + Math.floor(Math.random() * 10000);
    const inputPath = path.join(os.tmpdir(), `kiss_${tempId}.gif`);
    const outputPath = path.join(os.tmpdir(), `kiss_${tempId}.mp4`);

    // Write buffer to temp GIF file
    fs.writeFileSync(inputPath, gifBuffer);

    // Run FFmpeg command
    const command = `"${ffmpegPath.path}" -i "${inputPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${outputPath}" -y`;

    exec(command, (error) => {
      if (error) {
        // Cleanup and reject on error
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        return reject(error);
      }

      // Read the new MP4 file
      try {
        const mp4Buffer = fs.readFileSync(outputPath);
        
        // Cleanup temp files
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
        
        resolve(mp4Buffer);
      } catch (err) {
        reject(err);
      }
    });
  });
};

export const kiss = {
  name: 'kiss',
  aliases: ['animekiss', 'kissgif'],
  async run(ctx) {
    await ctx.react('💋');
    
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    const randomNum = Math.floor(Math.random() * KISS_GIF_COUNT) + 1;
    const gifUrl = `https://raw.githubusercontent.com/itsfizys/gifcdn/main/kiss/${randomNum}.gif`;

    try {
      logger.info(`[KISS] Downloading GIF #${randomNum}...`);
      
      // 1. Download GIF
      const response = await axios.get(gifUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 15000
      });

      const gifBuffer = Buffer.from(response.data, 'binary');
      logger.info(`[KISS] GIF downloaded. Converting to MP4...`);

      // 2. Convert to MP4
      const mp4Buffer = await convertToMp4(gifBuffer);
      logger.info(`[KISS] Conversion successful. MP4 Size: ${mp4Buffer.length} bytes`);

      // 3. Send MP4 as Video
      await ctx.send({
        video: mp4Buffer,
        mimetype: 'video/mp4',
        gifPlayback: true,
        caption: `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`,
        mentions: mentioned ? [mentioned] : [ctx.sender],
        contextInfo: getContextInfo()
      });

      logger.success(`[KISS] Sent successfully.`);
      await ctx.react('✅');

    } catch (err) {
      logger.error(`[KISS] Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`❌ Failed to send kiss GIF. Try again.`);
    }
  }
};
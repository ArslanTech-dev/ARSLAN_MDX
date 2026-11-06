/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIMEREACTION.JS — ARSLAN MDX Anime GIF Fetcher (Bulletproof)
 * ═══════════════════════════════════════════════════════════════════
 * 4-Level Fallback APIs + FFmpeg Conversion for 100% Playback.
 */

import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { Readable } from 'stream';
import logger from '../utils/logger.js';

// 🚀 Set FFmpeg Path
ffmpeg.setFfmpegPath(ffmpegPath.path);

// 🚀 Helper: Convert GIF Buffer to MP4 Buffer (In-memory, no disk write)
const convertToMp4 = (gifBuffer) => {
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

// 🚀 Helper: Fetch GIF from 3 different APIs
async function fetchGifFromAPIs(type) {
  // Level 1: Otakugifs
  try {
    const res = await axios.get(`https://api.otakugifs.xyz/gif?reaction=${type}`, { timeout: 8000 });
    if (res.data?.url) return res.data.url;
  } catch (err) {
    logger.warn(`[ANIME] Otakugifs failed for ${type}`);
  }

  // Level 2: Purrbot
  try {
    const res = await axios.get(`https://purrbot.site/api/img/sfw/${type}/gif`, { timeout: 8000 });
    if (res.data?.link) return res.data.link;
  } catch (err) {
    logger.warn(`[ANIME] Purrbot failed for ${type}`);
  }

  // Level 3: Nekos.best
  try {
    const res = await axios.get(`https://nekos.best/api/v2/${type}`, { timeout: 8000 });
    if (res.data?.results?.[0]?.url) return res.data.results[0].url;
  } catch (err) {
    logger.warn(`[ANIME] Nekos.best failed for ${type}`);
  }

  return null;
}

// 🚀 Main Function: Get Anime Video Buffer
export async function getAnimeVideoBuffer(type) {
  // 1. Fetch GIF URL
  const gifUrl = await fetchGifFromAPIs(type);
  if (!gifUrl) throw new Error('All APIs failed to fetch GIF.');

  logger.info(`[ANIME] Fetched ${type} GIF from API. Downloading...`);

  // 2. Download GIF as Buffer
  let gifBuffer;
  try {
    const response = await axios.get(gifUrl, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000
    });
    gifBuffer = Buffer.from(response.data, 'binary');
  } catch (err) {
    logger.error(`[ANIME] GIF download failed: ${err.message}`);
    throw new Error('Failed to download GIF.');
  }

  // 3. Convert to MP4 (The Magic Trick)
  try {
    logger.info(`[ANIME] Converting GIF to MP4...`);
    const mp4Buffer = await convertToMp4(gifBuffer);
    logger.success(`[ANIME] Conversion successful. Size: ${mp4Buffer.length} bytes`);
    return mp4Buffer;
  } catch (err) {
    logger.error(`[ANIME] FFmpeg conversion failed: ${err.message}`);
    // Fallback: Agar conversion fail ho, toh original GIF bhej dein
    return gifBuffer; 
  }
}
/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIMEREACTION.JS — ARSLAN MDX Anime GIF Fetcher (Bulletproof v2)
 * ═══════════════════════════════════════════════════════════════════
 * - Multi-API race (Promise.any)
 * - In-memory GIF → MP4 conversion (FFmpeg via PassThrough)
 * - URL cache (5 min TTL) to reduce API hits
 * - Strict validation: khaali/invalid buffer kabhi send nahi hoga
 */

import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { Readable, PassThrough } from 'stream';
import logger from '../utils/logger.js';

// 🚀 Set FFmpeg Path
ffmpeg.setFfmpegPath(ffmpegPath.path);

// 🚀 Config
const MAX_DOWNLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
const URL_CACHE_TTL = 5 * 60 * 1000;         // 5 minutes
const FFMPEG_TIMEOUT = 25000;                // 25s
const API_TIMEOUT = 5000;                    // 5s per API

// 🚀 Simple in-memory URL cache
const urlCache = new Map(); // type -> { url, ts }

function cacheGet(type) {
  const entry = urlCache.get(type);
  if (!entry) return null;
  if (Date.now() - entry.ts > URL_CACHE_TTL) {
    urlCache.delete(type);
    return null;
  }
  return entry.url;
}

function cacheSet(type, url) {
  urlCache.set(type, { url, ts: Date.now() });
}

// ═══════════════════════════════════════════════════════════════════
// 🎬 GIF → MP4 CONVERSION (THE FIX)
// ═══════════════════════════════════════════════════════════════════
const convertToMp4 = (gifBuffer) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const input = Readable.from(gifBuffer);
    const output = new PassThrough();

    const timer = setTimeout(() => {
      reject(new Error('FFmpeg conversion timeout'));
    }, FFMPEG_TIMEOUT);

    output.on('data', (chunk) => chunks.push(chunk));
    output.on('end', () => {
      clearTimeout(timer);
      const buf = Buffer.concat(chunks);
      if (!buf.length) return reject(new Error('Empty MP4 output'));
      resolve(buf);
    });
    output.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    ffmpeg(input)
      .inputFormat('gif')                        // 🔑 pipe input, format zaroori
      .outputFormat('mp4')
      .videoCodec('libx264')
      .outputOptions([
        '-preset', 'veryfast',                   // ⚡ fast
        '-pix_fmt', 'yuv420p',                   // WhatsApp compatibility
        '-movflags', 'faststart',                // progressive playback
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', // even dimensions (x264 zaroori)
        '-an',                                   // no audio
        '-loglevel', 'error',
      ])
      .on('start', (cmd) => logger.info(`[ANIME] FFmpeg started`))
      .on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      })
      .pipe(output, { end: true });              // 🔑 output yahan pipe hoga
  });
};

// ═══════════════════════════════════════════════════════════════════
// 🌐 MULTI-API RACE (Promise.any — fastest wins)
// ═══════════════════════════════════════════════════════════════════
async function fetchGifFromAPIs(type) {
  const tasks = [
    // Level 1: Otakugifs
    axios
      .get(`https://api.otakugifs.xyz/gif?reaction=${type}`, { timeout: API_TIMEOUT })
      .then((r) => {
        const url = r.data?.url;
        if (!url) throw new Error('no url');
        return url;
      }),

    // Level 2: Purrbot
    axios
      .get(`https://purrbot.site/api/img/sfw/${type}/gif`, { timeout: API_TIMEOUT })
      .then((r) => {
        const url = r.data?.link;
        if (!url) throw new Error('no url');
        return url;
      }),

    // Level 3: Nekos.best
    axios
      .get(`https://nekos.best/api/v2/${type}`, { timeout: API_TIMEOUT })
      .then((r) => {
        const url = r.data?.results?.[0]?.url || r.data?.url;
        if (!url) throw new Error('no url');
        return url;
      }),
  ];

  try {
    const url = await Promise.any(tasks);
    logger.info(`[ANIME] ${type} → ${url}`);
    return url;
  } catch {
    logger.warn(`[ANIME] All APIs failed for ${type}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 MAIN — Get Anime Video Buffer (returns MP4 Buffer)
// ═══════════════════════════════════════════════════════════════════
export async function getAnimeVideoBuffer(type) {
  // 1. Cache check
  let gifUrl = cacheGet(type);

  // 2. Fetch URL (if not cached)
  if (!gifUrl) {
    gifUrl = await fetchGifFromAPIs(type);
    if (!gifUrl) throw new Error(`No GIF found for "${type}"`);
    cacheSet(type, gifUrl);
  }

  // 3. Download GIF
  let gifBuffer;
  try {
    const response = await axios.get(gifUrl, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000,
      maxContentLength: MAX_DOWNLOAD_BYTES,
    });

    const size = parseInt(response.headers['content-length'] || '0', 10);
    if (size && size > MAX_DOWNLOAD_BYTES) {
      throw new Error(`File too large (${size} bytes)`);
    }

    gifBuffer = Buffer.from(response.data);
    if (!gifBuffer || gifBuffer.length < 100) {
      throw new Error('Downloaded GIF is empty/invalid');
    }
    logger.info(`[ANIME] Downloaded ${type} GIF (${gifBuffer.length} bytes)`);
  } catch (err) {
    logger.error(`[ANIME] Download failed: ${err.message}`);
    throw new Error('GIF download failed');
  }

  // 4. Fast-path: agar source already MP4 hai (rare, but possible)
  const isMp4 =
    gifBuffer.length > 12 && gifBuffer.slice(4, 8).toString('ascii') === 'ftyp';
  if (isMp4) {
    logger.info(`[ANIME] Source already MP4, skipping conversion`);
    return gifBuffer;
  }

  // 5. Convert to MP4
  try {
    logger.info(`[ANIME] Converting GIF → MP4...`);
    const mp4Buffer = await convertToMp4(gifBuffer);

    if (!mp4Buffer || mp4Buffer.length < 1000) {
      throw new Error(`Invalid MP4 buffer (${mp4Buffer?.length || 0} bytes)`);
    }

    logger.info(`[ANIME] ✅ Conversion OK (${mp4Buffer.length} bytes)`);
    return mp4Buffer;
  } catch (err) {
    logger.error(`[ANIME] FFmpeg failed: ${err.message}`);
    // 🔴 Raw GIF return NAHI karenge — warna `video/mp4` mimetype ke sath
    //    invalid payload jayega aur WhatsApp pe play nahi hoga.
    throw new Error('GIF conversion failed');
  }
}
/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIMEREACTION.JS — ARSLAN MDX Anime GIF Fetcher (v3 — fixed)
 * ═══════════════════════════════════════════════════════════════════
 * - Multi-API race (Promise.any) — sabse tez API jeetti hai
 * - GIF → MP4 conversion TEMP FILES se (pipe output par mp4 + faststart fail hota hai)
 * - URL pool: har type ke recent URLs yaad rehte hain (random fallback, sab ko same GIF nahi milta)
 * - Strict validation: khaali/invalid buffer kabhi send nahi hoga
 * - FFmpeg timeout par process kill hota hai + max 2 conversions ek saath
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import logger from '../utils/logger.js';

ffmpeg.setFfmpegPath(ffmpegPath.path);

// 🚀 Config
const MAX_DOWNLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
const FFMPEG_TIMEOUT = 25000;               // 25s
const API_TIMEOUT = 5000;                   // 5s per API
const POOL_SIZE = 20;                       // har type ke max URLs
const MAX_PARALLEL_CONVERSIONS = 2;         // chhote panel/VPS ko bachane ke liye

// ─────────────────────────────────────────────────────────────────
// 🗂️ URL pool (type -> [urls])
// ─────────────────────────────────────────────────────────────────
const urlPool = new Map();

function poolAdd(type, url) {
  const list = urlPool.get(type) || [];
  if (!list.includes(url)) list.push(url);
  if (list.length > POOL_SIZE) list.shift();
  urlPool.set(type, list);
}

function poolRandom(type, exclude) {
  const list = (urlPool.get(type) || []).filter((u) => u !== exclude);
  return list.length ? list[Math.floor(Math.random() * list.length)] : null;
}

// ─────────────────────────────────────────────────────────────────
// 🚦 Simple semaphore (parallel ffmpeg limit)
// ─────────────────────────────────────────────────────────────────
let running = 0;
const waiting = [];

async function acquire() {
  if (running < MAX_PARALLEL_CONVERSIONS) { running++; return; }
  await new Promise((resolve) => waiting.push(resolve));
  running++;
}

function release() {
  running--;
  const next = waiting.shift();
  if (next) next();
}

// ═══════════════════════════════════════════════════════════════════
// 🎬 GIF → MP4 (temp files; pipe output par faststart fail hota hai)
// ═══════════════════════════════════════════════════════════════════
const convertToMp4 = async (gifBuffer) => {
  await acquire();
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const inFile = path.join(os.tmpdir(), `anime_${id}.gif`);
  const outFile = path.join(os.tmpdir(), `anime_${id}.mp4`);

  try {
    fs.writeFileSync(inFile, gifBuffer);

    await new Promise((resolve, reject) => {
      let settled = false;
      const done = (fn, val) => { if (!settled) { settled = true; clearTimeout(timer); fn(val); } };

      const cmd = ffmpeg(inFile)
        .videoCodec('libx264')
        .outputOptions([
          '-preset', 'veryfast',
          '-pix_fmt', 'yuv420p',                        // WhatsApp compatibility
          '-movflags', 'faststart',                     // file par chalta hai (seekable)
          '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',   // even dimensions (x264 zaroori)
          '-an',
          '-loglevel', 'error'
        ])
        .on('end', () => done(resolve))
        .on('error', (err) => done(reject, err))
        .save(outFile);

      const timer = setTimeout(() => {
        try { cmd.kill('SIGKILL'); } catch {}          // 🔑 process leak nahi hoga
        done(reject, new Error('FFmpeg conversion timeout'));
      }, FFMPEG_TIMEOUT);
    });

    const buf = fs.readFileSync(outFile);
    if (!buf.length) throw new Error('Empty MP4 output');
    return buf;
  } finally {
    for (const f of [inFile, outFile]) { try { fs.unlinkSync(f); } catch {} }
    release();
  }
};

// ═══════════════════════════════════════════════════════════════════
// 🌐 MULTI-API RACE (Promise.any — fastest wins)
// ═══════════════════════════════════════════════════════════════════
async function fetchGifFromAPIs(type) {
  const tasks = [
    // Level 1: Otakugifs
    axios.get(`https://api.otakugifs.xyz/gif?reaction=${type}`, { timeout: API_TIMEOUT })
      .then((r) => { if (!r.data?.url) throw new Error('no url'); return r.data.url; }),

    // Level 2: Purrbot
    axios.get(`https://purrbot.site/api/img/sfw/${type}/gif`, { timeout: API_TIMEOUT })
      .then((r) => { if (!r.data?.link) throw new Error('no url'); return r.data.link; }),

    // Level 3: Nekos.best
    axios.get(`https://nekos.best/api/v2/${type}`, { timeout: API_TIMEOUT })
      .then((r) => {
        const url = r.data?.results?.[0]?.url || r.data?.url;
        if (!url) throw new Error('no url');
        return url;
      })
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
// ⬇️ DOWNLOAD + VALIDATE
// ═══════════════════════════════════════════════════════════════════
async function downloadMedia(url) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 10000,
    maxContentLength: MAX_DOWNLOAD_BYTES,
    maxBodyLength: MAX_DOWNLOAD_BYTES
  });

  const buf = Buffer.from(response.data);
  if (buf.length < 100) throw new Error('Downloaded file is empty/invalid');

  const isGif = buf.slice(0, 4).toString('ascii') === 'GIF8';
  const isMp4 = buf.length > 12 && buf.slice(4, 8).toString('ascii') === 'ftyp';
  if (!isGif && !isMp4) throw new Error('Not a GIF/MP4 file');
  return { buf, isMp4 };
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 MAIN — Get Anime Video Buffer (returns MP4 Buffer)
// ═══════════════════════════════════════════════════════════════════
export async function getAnimeVideoBuffer(type) {
  // 1. Naya URL lo; API fail ho to pool se random purana URL
  let gifUrl = await fetchGifFromAPIs(type);
  if (gifUrl) poolAdd(type, gifUrl);
  else gifUrl = poolRandom(type);
  if (!gifUrl) throw new Error(`No GIF found for "${type}"`);

  // 2. Download (fail ho to ek aur URL pool se try karo)
  let media;
  try {
    media = await downloadMedia(gifUrl);
  } catch (err) {
    logger.error(`[ANIME] Download failed (${err.message}), trying fallback`);
    const alt = poolRandom(type, gifUrl);
    if (!alt) throw new Error('GIF download failed');
    try {
      media = await downloadMedia(alt);
    } catch (err2) {
      logger.error(`[ANIME] Fallback download failed: ${err2.message}`);
      throw new Error('GIF download failed');
    }
  }
  logger.info(`[ANIME] Downloaded ${type} (${media.buf.length} bytes)`);

  // 3. Already MP4 ho to seedha
  if (media.isMp4) return media.buf;

  // 4. GIF → MP4
  try {
    const mp4 = await convertToMp4(media.buf);
    if (!mp4 || mp4.length < 1000) throw new Error(`Invalid MP4 buffer (${mp4?.length || 0} bytes)`);
    logger.info(`[ANIME] ✅ Conversion OK (${mp4.length} bytes)`);
    return mp4;
  } catch (err) {
    logger.error(`[ANIME] FFmpeg failed: ${err.message}`);
    // Raw GIF return NAHI karenge — warna video/mp4 mimetype ke sath play nahi hoga
    throw new Error('GIF conversion failed');
  }
}

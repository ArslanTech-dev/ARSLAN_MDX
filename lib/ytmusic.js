/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎵 YTMUSIC.JS — ARSLAN MDX · YouTube Audio Downloader (v3 — multi-source)
 * ═══════════════════════════════════════════════════════════════════
 * Pehle wali file sirf 1-3 free APIs par chalti thi — wo paid/band ho jati
 * hain (HTTP 402). Ab 3 layers hain, ek fail ho to agli khud chalti hai:
 *
 *   1️⃣ @distube/ytdl-core  → seedha YouTube se (koi API nahi, package.json mein pehle se hai)
 *   2️⃣ yt-dlp binary       → agar server par installed ho (optional, sab se reliable)
 *   3️⃣ Free APIs (race)    → jo pehle valid audio de
 *
 * ✅ Audio hamesha validate hota hai (HTML/error page kabhi send nahi hota)
 * ✅ Output MP3 (ya M4A) — WhatsApp par seedha play
 * ✅ Max 20 min ka video, max 24 MB, temp files khud delete
 * ✅ Optional cookies: project root par `cookies.json` (ytdl-core agent) ya env YT_COOKIES_FILE
 *    (YouTube "Sign in to confirm you're not a bot" block se bachne ke liye)
 * ═══════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import yts from 'yt-search';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import logger from '../utils/logger.js';

ffmpeg.setFfmpegPath(ffmpegPath.path);

// ───────────────────────── Config ─────────────────────────
const MAX_SECONDS = 20 * 60;            // is se lamba video nahi
const MAX_BYTES = 24 * 1024 * 1024;     // final audio ki limit
const DOC_LIMIT = 16 * 1024 * 1024;     // isse bari file document ki tarah jayegi
const API_TIMEOUT = 12000;
const DOWNLOAD_TIMEOUT = 60000;
const STALL_TIMEOUT = 25000;            // ytdl stream atak jaye to
const FFMPEG_TIMEOUT = 90000;
const YTDLP_TIMEOUT = 90000;
const TEMP_KEEP_MS = 10 * 60 * 1000;    // temp mp3 itni der baad delete

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

// ───────────────────────── Helpers ─────────────────────────
const YT_ID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#\s]*&)?v=|shorts\/|embed\/|live\/|v\/))([\w-]{11})/i;
const looksLikeUrl = (s) => /^https?:\/\//i.test(s);

const describe = (err) => (err?.response?.status ? `HTTP ${err.response.status}` : err?.message || String(err));
const rid = () => Math.random().toString(36).slice(2, 8);
const tmpFile = (name) => path.join(os.tmpdir(), `ytm_${Date.now()}_${rid()}_${name}`);
const rm = (...files) => { for (const f of files) { try { fs.unlinkSync(f); } catch {} } };
const safeName = (s) => String(s || 'audio').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '').slice(0, 80).trim() || 'audio';

class SourceError extends Error {}

// ───────────────────────── Audio sniff / convert ─────────────────────────
function sniffAudio(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf.slice(0, 3).toString('latin1') === 'ID3' || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0)) return 'mp3';
  if (buf.slice(4, 8).toString('latin1') === 'ftyp') return 'm4a';
  if (buf.slice(0, 4).toString('latin1') === 'OggS') return 'ogg';
  if (buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WAVE') return 'wav';
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return 'webm';
  if (buf.slice(0, 4).toString('latin1') === 'fLaC') return 'flac';
  return null; // HTML / JSON / error page sab reject
}

async function convertToMp3(inputPath, outputPath) {
  await new Promise((resolve, reject) => {
    let settled = false;
    const done = (fn, v) => { if (!settled) { settled = true; clearTimeout(timer); fn(v); } };
    const cmd = ffmpeg(inputPath)
      .outputOptions(['-vn', '-acodec', 'libmp3lame', '-b:a', '128k', '-ar', '44100', '-ac', '2'])
      .on('end', () => done(resolve))
      .on('error', (e) => done(reject, e))
      .save(outputPath);
    const timer = setTimeout(() => {
      try { cmd.kill('SIGKILL'); } catch {}
      done(reject, new Error('ffmpeg timeout'));
    }, FFMPEG_TIMEOUT);
  });
}

/** Raw audio buffer → validate → (zarurat ho to) MP3 → final file path */
async function finalizeAudio(rawBuffer, baseName) {
  const kind = sniffAudio(rawBuffer);
  if (!kind) throw new SourceError('Audio file valid nahi (HTML/error page)');
  if (rawBuffer.length > MAX_BYTES * 2) throw new SourceError('Audio bohot badi hai');

  // MP3 / M4A seedha chalte hain
  if (kind === 'mp3' || kind === 'm4a') {
    if (rawBuffer.length > MAX_BYTES) throw new SourceError('Audio 24MB se badi hai');
    const out = tmpFile(`${baseName}.${kind === 'mp3' ? 'mp3' : 'm4a'}`);
    fs.writeFileSync(out, rawBuffer);
    return { filePath: out, mimetype: kind === 'mp3' ? 'audio/mpeg' : 'audio/mp4', ext: kind === 'mp3' ? 'mp3' : 'm4a', size: rawBuffer.length };
  }

  // webm / ogg / wav / flac → MP3
  const inPath = tmpFile(`${baseName}.${kind}`);
  const outPath = tmpFile(`${baseName}.mp3`);
  try {
    fs.writeFileSync(inPath, rawBuffer);
    await convertToMp3(inPath, outPath);
    const size = fs.statSync(outPath).size;
    if (!size || size > MAX_BYTES) { rm(outPath); throw new SourceError('Converted audio invalid/badi'); }
    return { filePath: outPath, mimetype: 'audio/mpeg', ext: 'mp3', size };
  } finally {
    rm(inPath);
  }
}

// ───────────────────────── Video resolve ─────────────────────────
function normalizeVideo(v) {
  const id = v.videoId || (v.url && (v.url.match(YT_ID) || [])[1]);
  return {
    id,
    url: `https://www.youtube.com/watch?v=${id}`,
    title: v.title || 'Unknown',
    author: v.author?.name || v.author || 'YouTube',
    thumbnail: v.thumbnail || v.image || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null),
    seconds: Number(v.seconds) || 0,
    duration: v.timestamp || (v.seconds ? `${Math.floor(v.seconds / 60)}:${String(v.seconds % 60).padStart(2, '0')}` : 'Unknown'),
    views: v.views ? Number(v.views).toLocaleString() : 'N/A'
  };
}

async function resolveVideo(query) {
  const q = query.trim();
  const m = q.match(YT_ID);

  if (m) {
    const info = await yts({ videoId: m[1] });
    if (!info) throw new Error('Video nahi mila.');
    return normalizeVideo({ ...info, videoId: m[1] });
  }
  if (looksLikeUrl(q)) throw new Error('Sirf YouTube link ya gaane ka naam likho.');

  const res = await yts(q);
  const videos = (res?.videos || []).filter((v) => v.seconds > 0); // live streams skip
  if (!videos.length) throw new Error('Is naam se koi result nahi mila.');
  const fit = videos.find((v) => v.seconds <= MAX_SECONDS);
  if (!fit) throw new Error(`Video bohot lamba hai (max ${MAX_SECONDS / 60} minute).`);
  return normalizeVideo(fit);
}

// ═══════════════════════════════════════════════════════════════════
// 1️⃣ SOURCE: @distube/ytdl-core (seedha YouTube se)
// ═══════════════════════════════════════════════════════════════════
let ytdlModule; // undefined = abhi load nahi, null = installed nahi
let ytdlAgent;

async function loadYtdl() {
  if (ytdlModule !== undefined) return ytdlModule;
  try {
    const mod = await import('@distube/ytdl-core');
    ytdlModule = mod.default || mod;
  } catch {
    try {
      const mod = await import('ytdl-core');
      ytdlModule = mod.default || mod;
    } catch {
      ytdlModule = null;
    }
  }
  // Optional cookies (bot-check se bachne ke liye)
  try {
    const cookieFile = process.env.YT_COOKIES_FILE || path.join(process.cwd(), 'cookies.json');
    if (ytdlModule?.createAgent && fs.existsSync(cookieFile)) {
      ytdlAgent = ytdlModule.createAgent(JSON.parse(fs.readFileSync(cookieFile, 'utf8')));
      logger.info('[YTMUSIC] cookies.json loaded');
    }
  } catch (e) {
    logger.warn(`[YTMUSIC] cookies load failed: ${e.message}`);
  }
  return ytdlModule;
}

async function viaYtdlCore(video) {
  const ytdl = await loadYtdl();
  if (!ytdl) throw new SourceError('ytdl-core installed nahi');

  const stream = ytdl(video.url, {
    filter: 'audioonly',
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
    ...(ytdlAgent ? { agent: ytdlAgent } : {})
  });

  const chunks = [];
  let size = 0;
  await new Promise((resolve, reject) => {
    let timer;
    const bump = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { try { stream.destroy(); } catch {} reject(new Error('stream atak gaya')); }, STALL_TIMEOUT);
    };
    bump();
    stream.on('data', (c) => {
      size += c.length;
      if (size > MAX_BYTES * 2) { try { stream.destroy(); } catch {} clearTimeout(timer); return reject(new Error('audio bohot badi')); }
      chunks.push(c);
      bump();
    });
    stream.on('end', () => { clearTimeout(timer); resolve(); });
    stream.on('error', (e) => { clearTimeout(timer); reject(e); });
  });

  return finalizeAudio(Buffer.concat(chunks), safeName(video.id));
}

// ═══════════════════════════════════════════════════════════════════
// 2️⃣ SOURCE: yt-dlp binary (optional)
// ═══════════════════════════════════════════════════════════════════
let ytdlpBin; // undefined = check nahi hua, null = nahi mila

function run(bin, args, timeoutMs) {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => { err += d; if (err.length > 4000) err = err.slice(-4000); });
    const timer = setTimeout(() => { try { p.kill('SIGKILL'); } catch {} reject(new Error('yt-dlp timeout')); }, timeoutMs);
    p.on('error', (e) => { clearTimeout(timer); reject(e); });
    p.on('close', (code) => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(err.trim().split('\n').pop() || `exit ${code}`)); });
  });
}

async function findYtdlp() {
  if (ytdlpBin !== undefined) return ytdlpBin;
  const candidates = [process.env.YTDLP_PATH, 'yt-dlp', path.join(process.cwd(), 'bin', 'yt-dlp')].filter(Boolean);
  for (const bin of candidates) {
    try { await run(bin, ['--version'], 5000); ytdlpBin = bin; return bin; } catch {}
  }
  ytdlpBin = null;
  return null;
}

async function viaYtDlp(video) {
  const bin = await findYtdlp();
  if (!bin) throw new SourceError('yt-dlp installed nahi');

  const base = tmpFile(safeName(video.id));
  try {
    await run(bin, [
      '-f', 'bestaudio/best', '-x', '--audio-format', 'mp3', '--audio-quality', '5',
      '--no-playlist', '--max-filesize', '25M', '--no-warnings',
      '--ffmpeg-location', ffmpegPath.path,
      '-o', `${base}.%(ext)s`, video.url
    ], YTDLP_TIMEOUT);

    const out = `${base}.mp3`;
    if (!fs.existsSync(out)) throw new Error('yt-dlp ne file nahi banayi');
    const buf = fs.readFileSync(out);
    rm(out);
    return finalizeAudio(buf, safeName(video.id));
  } finally {
    // koi bhi bacha hua temp file saaf
    const dir = path.dirname(base);
    const prefix = path.basename(base);
    try { for (const f of fs.readdirSync(dir)) if (f.startsWith(prefix)) rm(path.join(dir, f)); } catch {}
  }
}

// ═══════════════════════════════════════════════════════════════════
// 3️⃣ SOURCE: Free APIs (race) — generic response parser
// ═══════════════════════════════════════════════════════════════════
const APIS = [
  { name: 'Siputzx',  url: (u) => `https://api.siputzx.my.id/api/d/ytmp3?url=${u}` },
  { name: 'Vreden',   url: (u) => `https://api.vreden.my.id/api/ytmp3?url=${u}` },
  { name: 'Ryzendesu', url: (u) => `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${u}` },
  { name: 'BK9',      url: (u) => `https://bk9.fun/download/ytmp3?url=${u}` },
  { name: 'Gifted',   url: (u) => `https://api.giftedtech.my.id/api/download/ytmp3?apikey=gifted&url=${u}` },
  { name: 'DavidCyril', url: (u) => `https://apis.davidcyriltech.my.id/youtube/mp3?url=${u}` },
  { name: 'Dreaded',  url: (u) => `https://api.dreaded.site/api/ytdl/audio?url=${u}` },
  { name: 'Agatz',    url: (u) => `https://api.agatz.xyz/api/ytmp3?url=${u}` },
  { name: 'Zenkey',   url: (u) => `https://api.zenkey.my.id/download/ytmp3?url=${u}` },
  { name: 'YanzBotz', url: (u) => `https://api.yanzbotz.my.id/api/download/ytmp3?url=${u}` }
];

const NOT_AUDIO_URL = /(ytimg\.com|googleusercontent|ggpht|youtube\.com\/(watch|shorts|channel|@)|youtu\.be\/|\.(jpe?g|png|webp|gif|svg)(\?|$))/i;

/** JSON ke andar se sab se munasib audio/download URL dhoondo (har API ka format alag hota hai) */
function findAudioUrl(data) {
  let best = null;
  const walk = (node, key, depth) => {
    if (depth > 6 || node == null) return;
    if (typeof node === 'string') {
      if (!/^https?:\/\//i.test(node) || NOT_AUDIO_URL.test(node)) return;
      let score = 0;
      if (/download|dl|audio|mp3|file/i.test(key)) score += 3;
      if (/\.(mp3|m4a|mp4|webm|opus|ogg)(\?|$)/i.test(node)) score += 2;
      if (/^(url|link)$/i.test(key)) score += 1;
      if (/download|dl\.|\/dl|convert|mp3/i.test(node)) score += 1;
      if (!best || score > best.score) best = { url: node, score };
    } else if (Array.isArray(node)) {
      for (const x of node) walk(x, key, depth + 1);
    } else if (typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, k, depth + 1);
    }
  };
  walk(data, '', 0);
  return best?.url || null;
}

async function downloadRemoteAudio(url) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: DOWNLOAD_TIMEOUT,
    maxContentLength: MAX_BYTES * 2,
    maxBodyLength: MAX_BYTES * 2,
    headers: { 'User-Agent': UA },
    validateStatus: (s) => s >= 200 && s < 300
  });
  const ctype = String(res.headers['content-type'] || '');
  if (/text\/html|application\/json/i.test(ctype)) throw new SourceError(`audio ki jagah ${ctype.split(';')[0]} mila`);
  return Buffer.from(res.data);
}

async function viaApis(video) {
  const encoded = encodeURIComponent(video.url);
  const errors = [];
  const arrived = [];

  const tasks = APIS.map((api) =>
    axios.get(api.url(encoded), { timeout: API_TIMEOUT, headers: { 'User-Agent': UA } })
      .then((r) => {
        const link = findAudioUrl(r.data);
        if (!link) throw new Error('response mein audio link nahi');
        arrived.push({ name: api.name, link });
        return link;
      })
      .catch((e) => { errors.push(`${api.name}: ${describe(e)}`); throw e; })
  );
  const allDone = Promise.allSettled(tasks);
  await Promise.any(tasks).catch(() => {});

  const tried = new Set();
  const attempt = async () => {
    for (const cand of [...arrived]) {
      if (tried.has(cand.link)) continue;
      tried.add(cand.link);
      try {
        const buf = await downloadRemoteAudio(cand.link);
        const out = await finalizeAudio(buf, safeName(video.id));
        return { ...out, apiName: cand.name };
      } catch (e) {
        errors.push(`${cand.name} (download): ${describe(e)}`);
      }
    }
    return null;
  };

  let result = await attempt();
  if (!result) { await allDone; result = await attempt(); }
  if (!result) throw new SourceError(`APIs fail: ${errors.join(' | ')}`);
  return result;
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 MAIN
// ═══════════════════════════════════════════════════════════════════
const SOURCES = [
  ['ytdl-core', viaYtdlCore],
  ['yt-dlp', viaYtDlp],
  ['apis', viaApis]
];

export async function downloadYouTubeAudio(query) {
  const video = await resolveVideo(String(query || ''));

  const failures = [];
  for (const [name, fn] of SOURCES) {
    try {
      logger.info(`[YTMUSIC] ${name}: ${video.title}`);
      const out = await fn(video);

      // Temp file kuch der baad khud delete
      const timer = setTimeout(() => rm(out.filePath), TEMP_KEEP_MS);
      timer.unref?.();

      const fileName = `${safeName(video.title)}.${out.ext}`;
      logger.info(`[YTMUSIC] ✅ ${name} (${(out.size / 1024 / 1024).toFixed(1)} MB)`);

      return {
        title: video.title,
        author: video.author,
        duration: video.duration,
        views: video.views,
        thumbnail: video.thumbnail,
        source: name === 'apis' ? `api:${out.apiName}` : name,

        // 🎧 Local file path — Baileys `{ url: path }` ya fs.readFileSync(path) dono chalte hain
        filePath: out.filePath,
        audioUrl: out.filePath,
        mimetype: out.mimetype,
        fileName,
        size: out.size,
        asDocument: out.size > DOC_LIMIT, // 16MB+ ho to document ki tarah bhejo
        cleanup: () => rm(out.filePath)
      };
    } catch (err) {
      failures.push(`${name}: ${describe(err)}`);
      logger.warn(`[YTMUSIC] ${name} failed: ${describe(err)}`);
    }
  }

  const error = new Error('Abhi koi download source kaam nahi kar raha (YouTube block ya APIs band). Thori der baad dobara try karo.');
  error.details = failures;
  logger.error(`[YTMUSIC] All sources failed → ${failures.join(' || ')}`);
  throw error;
}

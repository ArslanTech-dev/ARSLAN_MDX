/**
 * ═══════════════════════════════════════════════════════════════════
 * 💖 LOVE.JS — ARSLAN MDX Real HD Romantic Videos (3-Layer Fallback)
 * ═══════════════════════════════════════════════════════════════════
 * Layer 1: Pixabay API (Public Demo Key)
 * Layer 2: Coverr API (No Key)
 * Layer 3: Verified Mixkit Direct MP4
 */

import axios from 'axios';
import logger from '../utils/logger.js';

// 🔑 Pixabay Public Demo Key (Free tier)
const PIXABAY_KEY = '50331047-e9be991568dc6ca136acd003b';

// 🎬 Verified Mixkit Romantic Video (Last Resort)
const MIXKIT_FALLBACK = 'https://assets.mixkit.co/videos/52085/52085-720.mp4';

// 🚀 Layer 1: Pixabay
async function tryPixabay() {
  const res = await axios.get('https://pixabay.com/api/videos/', {
    params: {
      key: PIXABAY_KEY,
      q: 'romantic couple love',
      per_page: 15,
      video_type: 'film'
    },
    timeout: 10000
  });

  const hits = res.data.hits;
  if (!hits || hits.length === 0) throw new Error('Pixabay returned no videos');

  const randomVideo = hits[Math.floor(Math.random() * hits.length)];
  const videoUrl = randomVideo.videos.large?.url || randomVideo.videos.medium?.url || randomVideo.videos.small?.url;

  if (!videoUrl) throw new Error('Pixabay returned no valid URL');
  logger.info(`[LOVE] Pixabay succeeded`);
  return videoUrl;
}

// 🚀 Layer 2: Coverr (No Key)
async function tryCoverr() {
  const res = await axios.get('https://api.coverr.co/videos', {
    params: { query: 'romantic couple', page_size: 10 },
    timeout: 10000
  });

  const videos = res.data.hits || res.data.videos || res.data;
  if (!Array.isArray(videos) || videos.length === 0) throw new Error('Coverr returned no videos');

  const randomVideo = videos[Math.floor(Math.random() * videos.length)];
  const videoUrl = randomVideo.urls?.mp4_download || randomVideo.urls?.mp4 || randomVideo.download_url;

  if (!videoUrl) throw new Error('Coverr returned no valid URL');
  logger.info(`[LOVE] Coverr succeeded`);
  return videoUrl;
}

// 🚀 Layer 3: Mixkit Fallback
async function tryMixkit() {
  logger.info(`[LOVE] Using Mixkit fallback`);
  return MIXKIT_FALLBACK;
}

// 🚀 Main Function
export async function getRealLoveVideoUrl() {
  try {
    return await tryPixabay();
  } catch (e1) {
    logger.warn(`[LOVE] Pixabay failed: ${e1.message}`);
    try {
      return await tryCoverr();
    } catch (e2) {
      logger.warn(`[LOVE] Coverr failed: ${e2.message}`);
      return await tryMixkit();
    }
  }
}

// 🚀 Download Video as Buffer
export async function downloadLoveVideoBuffer(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 25000
    });
    return Buffer.from(response.data, 'binary');
  } catch (err) {
    logger.error(`[LOVE] Buffer download failed: ${err.message}`);
    return null;
  }
}
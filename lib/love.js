/**
 * ═══════════════════════════════════════════════════════════════════
 * 💖 LOVE.JS — ARSLAN MDX Romantic Video Fetcher
 * ═══════════════════════════════════════════════════════════════════
 * Primary: Direct Giphy MP4 links (Buffer download)
 * Fallback: Waifu.pics (Romantic GIFs)
 */

import axios from 'axios';
import logger from '../utils/logger.js';

// 🎬 12 Romantic/Love MP4 Links from Giphy
const LOVE_VIDEOS = [
  'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.mp4',
  'https://media.giphy.com/media/3o7TKrqBqfBqBqBqBq/giphy.mp4',
  'https://media.giphy.com/media/xUySTCDX1GZk8jO5sY/giphy.mp4',
  'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.mp4',
  'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.mp4',
  'https://media.giphy.com/media/26xBwdIuRJiAIqHwA/giphy.mp4',
  'https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.mp4',
  'https://media.giphy.com/media/l4FGpP4lxGGgK5CBW/giphy.mp4',
  'https://media.giphy.com/media/3o6ZsYm5P38Np4b8yY/giphy.mp4',
  'https://media.giphy.com/media/26BRBKqUiyraXdXyA/giphy.mp4',
  'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.mp4',
  'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4'
];

// 🚀 1. Download MP4 as Buffer from Giphy
async function downloadFromGiphy() {
  const randomUrl = LOVE_VIDEOS[Math.floor(Math.random() * LOVE_VIDEOS.length)];
  
  try {
    const response = await axios.get(randomUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    return Buffer.from(response.data, 'binary');
  } catch (err) {
    logger.warn(`[LOVE] Giphy failed: ${err.message}`);
    return null;
  }
}

// 🚀 2. Fallback: Download from Waifu.pics
async function downloadFromWaifu() {
  try {
    const res = await axios.get('https://api.waifu.pics/sfw/hug', {
      timeout: 10000
    });
    
    if (res.data.url) {
      const gifRes = await axios.get(res.data.url, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      return Buffer.from(gifRes.data, 'binary');
    }
    return null;
  } catch (err) {
    logger.warn(`[LOVE] Waifu failed: ${err.message}`);
    return null;
  }
}

// 🚀 3. Main Function
export async function getLoveVideoBuffer() {
  // Try Giphy first
  let buffer = await downloadFromGiphy();
  if (buffer && buffer.length > 0) {
    logger.info(`[LOVE] Giphy buffer downloaded. Size: ${buffer.length}`);
    return buffer;
  }

  // Fallback to Waifu.pics
  logger.info(`[LOVE] Trying Waifu.pics fallback...`);
  buffer = await downloadFromWaifu();
  if (buffer && buffer.length > 0) {
    logger.info(`[LOVE] Waifu buffer downloaded. Size: ${buffer.length}`);
    return buffer;
  }

  return null;
}
/**
 * ═══════════════════════════════════════════════════════════════════
 * 💖 COUPLE.JS — ARSLAN MDX Couple Logic (Direct MP4 Buffer)
 * ═══════════════════════════════════════════════════════════════════
 */

import axios from 'axios';
import logger from '../utils/logger.js';

// 🎨 Couple Comments
const COMMENTS = [
  { max: 20, text: "Bhai, yeh toh friendzone hai! 💔" },
  { max: 40, text: "Thoda sa pyar, thoda sa nafrat. 🤔" },
  { max: 60, text: "Achhi dosti lagti hai! 🤝" },
  { max: 80, text: "Wah! Kya jodi hai. 💕" },
  { max: 95, text: "Made for each other! 💖" },
  { max: 100, text: "Soulmates! Shaadi pakki hai. 💍" }
];

// 🎬 10+ Direct Giphy MP4 Links (Romantic Couple Vibes)
const COUPLE_VIDEOS = [
  'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.mp4',
  'https://media.giphy.com/media/3o7TKrqBqfBqBqBqBq/giphy.mp4',
  'https://media.giphy.com/media/xUySTCDX1GZk8jO5sY/giphy.mp4',
  'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.mp4',
  'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.mp4',
  'https://media.giphy.com/media/26xBwdIuRJiAIqHwA/giphy.mp4',
  'https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.mp4',
  'https://media.giphy.com/media/l4FGpP4lxGGgK5CBW/giphy.mp4',
  'https://media.giphy.com/media/3o6ZsYm5P38Np4b8yY/giphy.mp4',
  'https://media.giphy.com/media/26BRBKqUiyraXdXyA/giphy.mp4'
];

// 🚀 1. Calculate Ship
export function calculateShip() {
  const percent = Math.floor(Math.random() * 101);
  const comment = COMMENTS.find(c => percent <= c.max)?.text || "Pyara joda!";
  return { percent, comment };
}

// 🚀 2. Generate Couple Name
export function generateCoupleName(name1, name2) {
  const n1 = name1.length > 3 ? name1.slice(0, 3) : name1;
  const n2 = name2.length > 3 ? name2.slice(-3) : name2;
  return (n1 + n2).toUpperCase();
}

// 🚀 3. Download Romantic Video as Buffer
export async function getCoupleVideoBuffer() {
  // Pick a random video
  const randomVideoUrl = COUPLE_VIDEOS[Math.floor(Math.random() * COUPLE_VIDEOS.length)];
  logger.info(`[COUPLE] Downloading video: ${randomVideoUrl}`);

  try {
    const response = await axios.get(randomVideoUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000
    });

    const buffer = Buffer.from(response.data, 'binary');
    if (buffer.length === 0) throw new Error('Empty video buffer');
    
    logger.success(`[COUPLE] Video downloaded. Size: ${buffer.length} bytes`);
    return buffer;
  } catch (err) {
    logger.error(`[COUPLE] Failed to download video: ${err.message}`);
    return null;
  }
}
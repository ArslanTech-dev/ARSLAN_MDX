/**
 * ═══════════════════════════════════════════════════════════════════
 * 💖 COUPLE.JS — ARSLAN MDX Couple Logic (Video Edition)
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

// 🚀 3. Fetch Couple Video (Tenor + Giphy Fallback)
export async function getCoupleVideo() {
  // Try Tenor API (Returns MP4 links)
  try {
    const res = await axios.get('https://tenor.googleapis.com/v2/search', {
      params: {
        q: 'romantic couple love',
        limit: 15,
        key: 'LIVDSRZULELA',
        media_filter: 'mp4'
      },
      timeout: 10000
    });

    const results = res.data.results;
    if (results && results.length > 0) {
      const randomMedia = results[Math.floor(Math.random() * results.length)];
      const mp4Url = randomMedia.media_formats.mp4?.url;
      if (mp4Url) return mp4Url;
    }
  } catch (err) {
    logger.warn(`[COUPLE] Tenor API failed: ${err.message}`);
  }

  // Fallback: Giphy API
  try {
    const res = await axios.get('https://api.giphy.com/v1/gifs/search', {
      params: {
        api_key: 'dc6zaTOxFJmzC', // Public Beta Key
        q: 'romantic couple',
        limit: 15
      },
      timeout: 10000
    });

    const results = res.data.data;
    if (results && results.length > 0) {
      const randomMedia = results[Math.floor(Math.random() * results.length)];
      // Convert Giphy GIF to MP4 format for WhatsApp
      const mp4Url = randomMedia.images.original_mp4?.mp4 || randomMedia.images.original.url.replace('.gif', '.mp4');
      if (mp4Url) return mp4Url;
    }
  } catch (err) {
    logger.warn(`[COUPLE] Giphy API failed: ${err.message}`);
  }

  return null;
}
/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 AESTHETIC.JS — ARSLAN MDX Aesthetic Image Fetcher
 * ═══════════════════════════════════════════════════════════════════
 * Primary: Unsplash (High Quality)
 * Fallback: Picsum Photos
 */

import { CONFIG } from '../config.js';
import logger from '../utils/logger.js';

// 🎨 Random Aesthetic Queries
const AESTHETIC_QUERIES = [
  'aesthetic nature',
  'sunset aesthetic',
  'coffee aesthetic',
  'aesthetic vibes',
  'flowers aesthetic',
  'sky aesthetic',
  'minimalist aesthetic',
  'aesthetic room'
];

// ═══════════════════════════════════════════════════════════════════
// HELPER: Fetch from Unsplash
// ═══════════════════════════════════════════════════════════════════
async function getUnsplashImage(query) {
  if (!CONFIG.UNSPLASH_ACCESS_KEY) throw new Error('Unsplash Key missing');

  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${CONFIG.UNSPLASH_ACCESS_KEY}&orientation=portrait`;
  
  const res = await fetch(url, {
    signal: AbortSignal.timeout(10000)
  });

  if (!res.ok) throw new Error(`Unsplash HTTP ${res.status}`);

  const data = await res.json();
  if (!data.urls || !data.urls.regular) throw new Error('Unsplash returned no image');

  return {
    imageUrl: data.urls.regular,
    author: data.user?.name || 'Unknown',
    description: data.alt_description || query
  };
}

// ═══════════════════════════════════════════════════════════════════
// HELPER: Picsum Fallback
// ═══════════════════════════════════════════════════════════════════
async function getPicsumImage() {
  return {
    imageUrl: `https://picsum.photos/1080/1920?random=${Date.now()}`,
    author: 'Picsum',
    description: 'Random Aesthetic Image'
  };
}

// ═══════════════════════════════════════════════════════════════════
// COMMAND: .aesthetic
// ═══════════════════════════════════════════════════════════════════
export const aesthetic = {
  name: 'aesthetic',
  aliases: ['vibes', 'aes'],
  async run(ctx) {
    await ctx.react('🌸');

    // Pick a random query
    const query = AESTHETIC_QUERIES[Math.floor(Math.random() * AESTHETIC_QUERIES.length)];
    
    let imageData = null;

    // 1. Try Unsplash
    try {
      imageData = await getUnsplashImage(query);
      logger.info(`[AESTHETIC] Fetched from Unsplash: ${query}`);
    } catch (err) {
      logger.warn(`[AESTHETIC] Unsplash failed: ${err.message}. Trying Picsum...`);
      
      // 2. Fallback to Picsum
      try {
        imageData = await getPicsumImage();
        logger.info(`[AESTHETIC] Fetched from Picsum fallback.`);
      } catch (fallbackErr) {
        logger.error(`[AESTHETIC] All APIs failed: ${fallbackErr.message}`);
        await ctx.react('❌');
        return ctx.reply(`> ❌ *Failed to fetch aesthetic image.*`);
      }
    }

    // 3. Send Image
    try {
      const caption = `> 🌸 *AESTHETIC VIBES*
> 📸 *By:* ${imageData.author}
> 🏷️ *Query:* ${query}

> © POWERED BY ARSLAN MD`;

      await ctx.send({
        image: { url: imageData.imageUrl },
        caption: caption
      });

      await ctx.react('✅');

    } catch (sendErr) {
      logger.error(`[AESTHETIC] Send Error: ${sendErr.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Failed to send image.*`);
    }
  }
};
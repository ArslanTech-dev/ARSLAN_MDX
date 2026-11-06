/**
 * ═══════════════════════════════════════════════════════════════════
 * 🖼️ WALLPAPER.JS — ARSLAN MDX 100% Working Wallpaper Fetcher
 * ═══════════════════════════════════════════════════════════════════
 * Primary: Bing Wallpaper API (No key, UHD 4K)
 * Fallback: Picsum Photos
 */

import logger from '../utils/logger.js';

// ═══════════════════════════════════════════════════════════════════
// HELPER: Fetch from Bing Wallpaper API
// ═══════════════════════════════════════════════════════════════════
async function getBingWallpaper() {
  // index=random picks a random wallpaper from the last 8 days
  const url = 'https://bing.biturl.top/?resolution=UHD&format=json&index=random&mkt=en-US';
  
  const res = await fetch(url, {
    signal: AbortSignal.timeout(10000) // 10 sec timeout
  });

  if (!res.ok) throw new Error(`Bing API HTTP ${res.status}`);

  const data = await res.json();
  
  if (!data.url) throw new Error('Bing API returned no URL');

  return {
    imageUrl: data.url,
    title: data.copyright || 'Bing Daily Wallpaper'
  };
}

// ═══════════════════════════════════════════════════════════════════
// HELPER: Fetch from Picsum (Fallback)
// ═══════════════════════════════════════════════════════════════════
async function getPicsumWallpaper() {
  // Picsum returns a random image. We can just use the redirect URL.
  const imageUrl = `https://picsum.photos/1080/1920?random=${Date.now()}`;
  
  return {
    imageUrl: imageUrl,
    title: 'Random High-Quality Wallpaper'
  };
}

// ═══════════════════════════════════════════════════════════════════
// COMMAND: .wallpaper / .wall / .wp
// ═══════════════════════════════════════════════════════════════════
export const wallpaper = {
  name: 'wallpaper',
  aliases: ['wall', 'wp', 'bg'],
  async run(ctx) {
    await ctx.react('🖼️');

    let wallpaperData = null;

    // 🚀 1. Try Bing Wallpaper (Primary)
    try {
      wallpaperData = await getBingWallpaper();
      logger.info(`[WALLPAPER] Fetched from Bing: ${wallpaperData.title}`);
    } catch (err) {
      logger.warn(`[WALLPAPER] Bing failed: ${err.message}. Trying Picsum...`);
      
      // 🚀 2. Fallback to Picsum
      try {
        wallpaperData = await getPicsumWallpaper();
        logger.info(`[WALLPAPER] Fetched from Picsum.`);
      } catch (fallbackErr) {
        logger.error(`[WALLPAPER] All APIs failed: ${fallbackErr.message}`);
        await ctx.react('❌');
        return ctx.reply(`> ❌ *Failed to fetch wallpaper.*\n> Please try again later.`);
      }
    }

    // 🎨 3. Send the Image
    try {
      const caption = `> 🖼️ *WALLPAPER DOWNLOADED*
> 📝 ${wallpaperData.title}

> © POWERED BY ARSLAN MD`;

      await ctx.send({
        image: { url: wallpaperData.imageUrl },
        caption: caption
      });

      await ctx.react('✅');

    } catch (sendErr) {
      logger.error(`[WALLPAPER] Send Error: ${sendErr.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Failed to send image.*`);
    }
  }
};
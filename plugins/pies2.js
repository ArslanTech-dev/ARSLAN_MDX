/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌍 PIES2.JS — ARSLAN MDX 15 Countries Image Fetcher
 * ═══════════════════════════════════════════════════════════════════
 * Commands: .india, .pakistan, .japan, etc. (15 Countries)
 * Fallback: Unsplash API (if Shizo API fails)
 */

import logger from '../utils/logger.js';
import { CONFIG } from '../config.js';

// 🚀 Helper: Fetch from Shizo API
async function fetchFromShizo(country) {
    const url = `https://shizoapi.onrender.com/api/pies/${country}?apikey=shizo`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    
    if (!res.ok) throw new Error(`Shizo HTTP ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('image')) throw new Error('Shizo did not return an image');
    
    return res.arrayBuffer().then(b => Buffer.from(b));
}

// 🚀 Helper: Fetch from Unsplash API (Fallback)
async function fetchFromUnsplash(country) {
    if (!CONFIG.UNSPLASH_ACCESS_KEY) throw new Error('No Unsplash Key');
    
    const query = `${country} girl aesthetic`;
    const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${CONFIG.UNSPLASH_ACCESS_KEY}&orientation=portrait`;
    
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    
    if (!data.urls || !data.urls.regular) throw new Error('Unsplash did not return an image');
    
    // Download the Unsplash image to a buffer
    const imgRes = await fetch(data.urls.regular);
    return imgRes.arrayBuffer().then(b => Buffer.from(b));
}

// 🚀 The Master Function for Country Commands
const createCountryCommand = (countryName) => {
    return {
        name: countryName,
        async run(ctx) {
            await ctx.react('⏳');
            
            let imageBuffer = null;
            
            // 1. Try Shizo API
            try {
                imageBuffer = await fetchFromShizo(countryName);
                logger.info(`[PIES2] ${countryName} fetched from Shizo API`);
            } catch (err) {
                logger.warn(`[PIES2] Shizo failed for ${countryName}. Trying Unsplash...`);
                
                // 2. Try Unsplash Fallback
                try {
                    imageBuffer = await fetchFromUnsplash(countryName);
                    logger.info(`[PIES2] ${countryName} fetched from Unsplash API`);
                } catch (unErr) {
                    logger.error(`[PIES2] All APIs failed for ${countryName}: ${unErr.message}`);
                }
            }

            // 3. Send or Fail
            if (imageBuffer) {
                await ctx.send({
                    image: imageBuffer,
                    caption: `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`
                });
                await ctx.react('✅');
            } else {
                await ctx.react('❌');
                await ctx.reply(`> ❌ *Failed to fetch image for ${countryName}.*\n> Please try again later.`);
            }
        }
    };
};

// ═══════════════════════════════════════════════════════════════════
// 🌍 15 COUNTRY COMMANDS EXPORTS
// ═══════════════════════════════════════════════════════════════════

export const iran = createCountryCommand('iran');
export const canada = createCountryCommand('canada');
export const india = createCountryCommand('india');
export const pakistan = createCountryCommand('pakistan');
export const china = createCountryCommand('china');
export const indonesia = createCountryCommand('indonesia');
export const japan = createCountryCommand('japan');
export const korea = createCountryCommand('korea');
export const turkey = createCountryCommand('turkey');
export const russia = createCountryCommand('russia');
export const usa = createCountryCommand('usa');
export const uk = createCountryCommand('uk');
export const saudi = createCountryCommand('saudi');
export const dubai = createCountryCommand('dubai');
export const bangladesh = createCountryCommand('bangladesh');
/**
 * ═══════════════════════════════════════════════════════════════════
 * 🍰 PIES2.JS — ARSLAN MDX 15 Countries Image Fetcher (Simple)
 * ═══════════════════════════════════════════════════════════════════
 */

import logger from '../utils/logger.js';

// 🌍 15 Supported Countries
const VALID_COUNTRIES = [
  'iran', 'canada', 'india', 'pakistan', 
  'china', 'indonesia', 'japan', 'korea', 
  'turkey', 'russia', 'usa', 'uk', 
  'saudi', 'dubai', 'bangladesh'
];

// Helper: Fetch image buffer
async function fetchPiesImageBuffer(country) {
    const url = `https://shizoapi.onrender.com/api/pies/${country}?apikey=shizo`;
    const res = await fetch(url);
    
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('image')) {
        throw new Error('API did not return an image');
    }
    
    return res.arrayBuffer().then(b => Buffer.from(b));
}

export const pies2 = {
    name: 'pies2',
    aliases: ['pie2', 'country'],
    async run(ctx) {
        const sub = (ctx.args[0] || '').toLowerCase();

        // 1. Check if country is provided
        if (!sub) {
            return ctx.reply(
`> 🍰 *Usage:* ${ctx.prefix}pies2 <country>\n> *Available:* ${VALID_COUNTRIES.join(', ')}`
            );
        }

        // 2. Check if country is in the list
        if (!VALID_COUNTRIES.includes(sub)) {
            return ctx.reply(
`> ❌ *Invalid Country.*\n> Try one of these: ${VALID_COUNTRIES.join(', ')}`
            );
        }

        await ctx.react('⏳');

        try {
            // 3. Fetch the image
            const imageBuffer = await fetchPiesImageBuffer(sub);
            
            // 4. Simple Caption
            const caption = `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`;

            // 5. Send image (No Context Info)
            await ctx.send({
                image: imageBuffer,
                caption: caption
            });

            await ctx.react('✅');

        } catch (err) {
            logger.error(`[PIES2] Failed: ${err.message}`);
            await ctx.react('❌');
            await ctx.reply(`> ❌ *Failed to fetch image for ${sub}.*`);
        }
    }
};
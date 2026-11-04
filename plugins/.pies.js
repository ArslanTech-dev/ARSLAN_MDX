/**
 * ═══════════════════════════════════════════════════════════════════
 * 🍰 PIES.JS — Country-wise Image Fetcher
 * ═══════════════════════════════════════════════════════════════════
 * Fetch images from ShizoAPI based on country.
 */

import logger from '../utils/logger.js';

const BASE = 'https://shizoapi.onrender.com/api/pies';
const VALID_COUNTRIES = ['china', 'indonesia', 'japan', 'korea', 'hijab'];

// 🚀 View Channel Context (Forwarded Style)
const getContextInfo = () => {
  return {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363412450457588@newsletter', 
      newsletterName: 'ARSLAN MDX',
      serverMessageId: 143
    }
  };
};

// Helper: Fetch image buffer
async function fetchPiesImageBuffer(country) {
    const url = `${BASE}/${country}?apikey=shizo`;
    const res = await fetch(url);
    
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('image')) {
        throw new Error('API did not return an image');
    }
    
    return res.arrayBuffer().then(b => Buffer.from(b));
}

export const pies = {
    name: 'pies',
    aliases: ['pie'],
    async run(ctx) {
        const sub = (ctx.args[0] || '').toLowerCase();

        // 1. Check if country is provided
        if (!sub) {
            return ctx.reply(
`> 🍰 *𝐏𝐈𝐄𝐒 𝐂𝐎𝐌𝐌𝐀𝐍𝐃*
> ╰─➤ Usage: ${ctx.prefix}pies <country>
> ╰─➤ Countries: ${VALID_COUNTRIES.join(', ')}`
            );
        }

        // 2. Check if country is valid
        if (!VALID_COUNTRIES.includes(sub)) {
            return ctx.reply(
`> ❌ *INVALID COUNTRY*
> ╰─➤ Try one of: ${VALID_COUNTRIES.join(', ')}`
            );
        }

        await ctx.react('⏳');

        try {
            // 3. Fetch the image
            const imageBuffer = await fetchPiesImageBuffer(sub);
            
            // 4. Premium Caption
            const caption = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋🍰 *𝐏𝐈𝐄𝐒 𝐈𝐌𝐀𝐆𝐄*
┇◆┋
┇◆┋🌍 *Country:* ${sub.toUpperCase()}
┇◆┋📥 *Status:* Downloaded
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

            // 5. Send image
            await ctx.send({
                image: imageBuffer,
                caption: caption,
                contextInfo: getContextInfo()
            });

            await ctx.react('✅');

        } catch (err) {
            logger.error(`[PIES] Failed: ${err.message}`);
            await ctx.react('❌');
            await ctx.reply(`> ❌ *Failed to fetch image.*\n> Please try again later.`);
        }
    }
};
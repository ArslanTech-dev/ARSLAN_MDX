/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  💖 ROMANTIC.JS — ARSLAN MDX · Romantic Pics (No Unsplash)       ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Commands: romantic, love, couple, valentine                     ║
 * ║  Source: LoremFlickr & Waifu.pics (No API Key Required)          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import axios from 'axios';
import logger from '../utils/logger.js';

// ═══════════════════════════════════════════════════════════════════
// 🔤 BOLD SERIF FONT (Premium Design)
// ═══════════════════════════════════════════════════════════════════
const BOLD = {
  '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗',
  'A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆','H':'𝐇','I':'𝐈','J':'𝐉',
  'K':'𝐊','L':'𝐋','M':'𝐌','N':'𝐍','O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓',
  'U':'𝐔','V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙',
  'a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠','h':'𝐡','i':'𝐢','j':'𝐣',
  'k':'𝐤','l':'𝐥','m':'𝐦','n':'𝐧','o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭',
  'u':'𝐮','v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳',
};
const bold = (s) => String(s).replace(/[0-9A-Za-z]/g, (c) => BOLD[c] || c);

// ═══════════════════════════════════════════════════════════════════
// ⏱️ COOLDOWN (4s per user)
// ═══════════════════════════════════════════════════════════════════
const cooldown = new Map();
const digits = (jid) => String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

function onCooldown(ctx) {
  const key = digits(ctx.sender) || ctx.from;
  const now = Date.now();
  if (now - (cooldown.get(key) || 0) < 4000) return true;
  cooldown.set(key, now);
  if (cooldown.size > 500) cooldown.delete(cooldown.keys().next().value);
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// 🌐 FETCH ROMANTIC IMAGE (No API Key)
// ═══════════════════════════════════════════════════════════════════
async function fetchRomanticImage(query) {
    // Method 1: LoremFlickr (Real Couples/Love Photos)
    try {
        // Format: https://loremflickr.com/width/height/tag1,tag2/all
        const flickrUrl = `https://loremflickr.com/1080/1920/${encodeURIComponent(query)}/all`;
        
        // URL valid hai ya nahi check karne ke liye ek chota request
        await axios.head(flickrUrl, { timeout: 8000 });
        return flickrUrl;
    } catch (err) {
        logger.warn(`[ROMANTIC] LoremFlickr failed, using Anime fallback...`);
    }

    // Method 2: Anime Romantic Fallback (Waifu.pics)
    try {
        const res = await axios.get(`https://api.waifu.pics/nsfw`, { timeout: 8000 });
        if (res.data?.url) return res.data.url;
    } catch (err) {
        logger.warn(`[ROMANTIC] Anime fallback failed too.`);
    }

    throw new Error('All romantic image sources failed.');
}

// ═══════════════════════════════════════════════════════════════════
// 🏭 COMMAND FACTORY
// ═══════════════════════════════════════════════════════════════════
function createRomanticCommand({ name, aliases, emoji, title, defaultQuery }) {
    return {
        name,
        aliases,
        async run(ctx) {
            if (onCooldown(ctx)) return;
            try { await ctx.react(emoji); } catch {}

            const userQuery = ctx.args.join(' ').trim();
            
            // Agar user ne custom search ki hai (e.g. ".romantic sunset"), toh usay use karo
            // Warna default query (e.g. "romantic,couple") use karo
            const query = userQuery ? userQuery.replace(/\s+/g, ',') : defaultQuery;

            try {
                const imageUrl = await fetchRomanticImage(query);

                const caption = `> ${emoji} *${bold(title)}*\n` +
                    `> ────────────────\n` +
                    `> 🔍 \`Search : ${query.replace(/,/g, ' ')}\`\n` +
                    `> ────────────────\n` +
                    `> 💫 _POWERED BY ARSLAN MD_ 💫`;

                await ctx.send({
                    image: { url: imageUrl },
                    caption: caption
                });

                try { await ctx.react('✅'); } catch {}
            } catch (err) {
                logger.error(`[ROMANTIC] ${name} failed: ${err.message}`);
                try { await ctx.react('❌'); } catch {}
                await ctx.reply(`> ❌ *${bold('ERROR')}*\n> ╰─➤ Failed to fetch image.\n> ╰─➤ Try again later.`);
            }
        }
    };
}

// ═══════════════════════════════════════════════════════════════════
// 📦 COMMANDS EXPORT
// ═══════════════════════════════════════════════════════════════════

// 💖 1. General Romantic
export const romantic = createRomanticCommand({
    name: 'nsfw',
    aliases: ['tits', 'milk'],
    emoji: '💋',
    title: 'ROMANTIC PICTURE',
    defaultQuery: 'nsfw'
});

// ❤️ 2. Love / Hearts
export const love = createRomanticCommand({
    name: 'love',
    aliases: ['lovepic', 'hearts'],
    emoji: '❤️',
    title: 'LOVE PICTURE',
    defaultQuery: 'love,heart,romantic'
});

// 👩‍❤️‍👨 3. Couples
export const couple = createRomanticCommand({
    name: 'couple',
    aliases: ['couples', 'couplegoals'],
    emoji: '👩‍❤️‍👨',
    title: 'COUPLE GOALS',
    defaultQuery: 'couple,inlove,holdinghands'
});

// 🌹 4. Valentine / Roses
export const valentine = createRomanticCommand({
    name: 'valentine',
    aliases: ['valentines', '14feb'],
    emoji: '🌹',
    title: 'VALENTINE SPECIAL',
    defaultQuery: 'valentine,roses,love'
});
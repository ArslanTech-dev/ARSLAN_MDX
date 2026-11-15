/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🌸 ANIMEGIRL.JS — ARSLAN MDX · Anime Girl Picture Fetcher       ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Commands: waifu, neko, maid, megumin, shinobu, smug, blush,      ║
 * ║            dance, happy, wink, animegirl                         ║
 * ║                                                                  ║
 * ║  Features: Multi-API Fallback, No API Key required, Premium UI    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import axios from 'axios';
import logger from '../utils/logger.js';

// ═══════════════════════════════════════════════════════════════════
// ⏱️ COOLDOWN (3s per user, taake spam na ho)
// ═══════════════════════════════════════════════════════════════════
const cooldown = new Map();
const digits = (jid) => String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

function onCooldown(ctx) {
  const key = digits(ctx.sender) || ctx.from;
  const now = Date.now();
  if (now - (cooldown.get(key) || 0) < 3000) return true;
  cooldown.set(key, now);
  if (cooldown.size > 500) cooldown.delete(cooldown.keys().next().value);
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// 🌐 MULTI-API FETCHER
// ═══════════════════════════════════════════════════════════════════
async function fetchAnimeImage(type) {
    const apis = [
        // API 1: Waifu.pics
        async () => {
            const res = await axios.get(`https://api.waifu.pics/nsfw/${type}`, { timeout: 10000 });
            if (res.data?.url) return res.data.url;
            throw new Error('Waifu.pics failed');
        },
        // API 2: Nekos.best
        async () => {
            const res = await axios.get(`https://nekos.best/api/v2/${type}`, { timeout: 10000 });
            if (res.data?.results?.[0]?.url) return res.data.results[0].url;
            throw new Error('Nekos.best failed');
        },
        // API 3: Waifu.im (Only for waifu/maid/neko)
        async () => {
            const tag = type === 'animegirl' ? 'waifu' : type;
            const res = await axios.get(`https://api.waifu.im/search?included_tags=${tag}&is_nsfw=true`, { timeout: 10000 });
            if (res.data?.images?.[0]?.url) return res.data.images[0].url;
            throw new Error('Waifu.im failed');
        }
    ];

    for (const api of apis) {
        try {
            const url = await api();
            if (url) return url;
        } catch (err) {
            // Ignore and try next API
        }
    }
    return null;
}

// ═══════════════════════════════════════════════════════════════════
// 🏭 COMMAND FACTORY
// ═══════════════════════════════════════════════════════════════════
function createAnimeCommand({ name, aliases, emoji, title, type }) {
    return {
        name,
        aliases,
        async run(ctx) {
            if (onCooldown(ctx)) return;
            try { await ctx.react(emoji); } catch {}

            try {
                // Default type fallback
                const apiType = type || name; 
                const imageUrl = await fetchAnimeImage(apiType);

                if (!imageUrl) {
                    throw new Error('All APIs failed to fetch image.');
                }

                const caption = 
                    `> ${emoji} *${title}*\n` +
                    `> ────────────────\n` +
                    `> 🎀 \`Type : ${apiType.toUpperCase()}\`\n` +
                    `> ────────────────\n` +
                    `> 💫 _POWERED BY ARSLAN MD_ 💫`;

                await ctx.send({
                    image: { url: imageUrl },
                    caption: caption
                });

                try { await ctx.react('✅'); } catch {}
            } catch (err) {
                logger.error(`[ANIMEGIRL] ${name} failed: ${err.message}`);
                try { await ctx.react('❌'); } catch {}
                await ctx.reply(`> ❌ *Failed to fetch ${name} image.*\n> ╰─➤ Please try again later.`);
            }
        }
    };
}

// ═══════════════════════════════════════════════════════════════════
// 📦 COMMANDS EXPORT
// ═══════════════════════════════════════════════════════════════════

// 1. Generic Anime Girl (Random Waifu)
export const animegirl = createAnimeCommand({
    name: 'animegirl', aliases: ['ag', 'animepic'], emoji: '🌸', title: 'ANIME GIRL', type: 'waifu'
});

// 2. Waifu
export const waifu = createAnimeCommand({
    name: 'waifu', aliases: ['wife'], emoji: '💖', title: 'WAIFU', type: 'waifu'
});

// 3. Neko (Cat Girl)
export const neko = createAnimeCommand({
    name: 'neko', aliases: ['catgirl'], emoji: '🐱', title: 'NEKO GIRL', type: 'neko'
});

// 4. Maid
export const maid = createAnimeCommand({
    name: 'maid', aliases: ['maidgirl'], emoji: '🧹', title: 'MAID GIRL', type: 'maid'
});

// 5. Megumin (Konosuba)
export const megumin = createAnimeCommand({
    name: 'megumin', aliases: [], emoji: '💥', title: 'MEGUMIN', type: 'megumin'
});

// 6. Shinobu (Demon Slayer)
export const shinobu = createAnimeCommand({
    name: 'shinobu', aliases: [], emoji: '🦋', title: 'SHINOBU', type: 'shinobu'
});

// 7. Smug / Tsundere
export const smug = createAnimeCommand({
    name: 'smug', aliases: ['tsundere'], emoji: '😏', title: 'SMUG GIRL', type: 'smug'
});

// 8. Blush
export const blush = createAnimeCommand({
    name: 'blush', aliases: ['shy'], emoji: '😊', title: 'BLUSHING GIRL', type: 'blush'
});

// 9. Dance
export const dance = createAnimeCommand({
    name: 'dance', aliases: ['dancing'], emoji: '💃', title: 'DANCING GIRL', type: 'dance'
});

// 10. Happy
export const happy = createAnimeCommand({
    name: 'happy', aliases: ['smile'], emoji: '😄', title: 'HAPPY GIRL', type: 'happy'
});

// 11. Wink
export const wink = createAnimeCommand({
    name: 'wink', aliases: [], emoji: '😉', title: 'WINKING GIRL', type: 'wink'
});
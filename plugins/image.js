/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🌸 IMAGE.JS — ARSLAN MDX · Premium Image Fetcher (v3)           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Commands (8): girl · boy · anime · nature · car · food ·        ║
 * ║                wallpaper · img                                   ║
 * ║                                                                  ║
 * ║  Source   : Unsplash API (free tier: 50 req/hour)                ║
 * ║  Fixes    : random-pick (no repeat) · random page · 30 per page  ║
 * ║             timeout · cooldown · cache · attribution · view ch.  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { CONFIG } from '../config.js';
import logger from '../utils/logger.js';

// ═══════════════════════════════════════════════════════════════════
// 🚀 VIEW CHANNEL CONTEXT (Forwarded Badge)
// ═══════════════════════════════════════════════════════════════════
const getContextInfo = () => ({
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363412450457588@newsletter',
    newsletterName: 'ARSLAN MDX',
    serverMessageId: 143,
  },
});

// ═══════════════════════════════════════════════════════════════════
// 🔤 BOLD SERIF FONT (same as general.js)
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
// ⏱️ COOLDOWN (5s per user — save Unsplash quota)
// ═══════════════════════════════════════════════════════════════════
const cooldown = new Map();
const digits = (jid) => String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

function onCooldown(ctx) {
  const key = digits(ctx.sender) || ctx.from;
  const now = Date.now();
  if (now - (cooldown.get(key) || 0) < 5000) return true;
  cooldown.set(key, now);
  if (cooldown.size > 500) cooldown.delete(cooldown.keys().next().value);
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// 💾 CACHE (5 min TTL — stores ARRAY of images, not one)
// ═══════════════════════════════════════════════════════════════════
const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map(); // query -> { images: [...], ts }

function cacheGet(key) {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() - e.ts > CACHE_TTL) { cache.delete(key); return null; }
  return e.images;
}
function cacheSet(key, images) {
  cache.set(key, { images, ts: Date.now() });
  if (cache.size > 100) cache.delete(cache.keys().next().value);
}

// ═══════════════════════════════════════════════════════════════════
// 🌐 SAFE FETCH WITH TIMEOUT
// ═══════════════════════════════════════════════════════════════════
async function fetchWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🎨 CAPTION BUILDER
// ═══════════════════════════════════════════════════════════════════
function buildCaption(title, query, photographer, photographerLink) {
  return (
    `> 🌸 *${bold(title)}*\n` +
    `> ────────────────\n` +
    `> 🔍 \`𝐒𝐞𝐚𝐫𝐜𝐡: ${bold(query)}\`\n` +
    `> 📸 \`𝐁𝐲: ${photographer}\`\n` +
    `> 🔗 \`𝐒𝐨𝐮𝐫𝐜𝐞: ${photographerLink.replace('https://', '')}\`\n` +
    `> ────────────────\n` +
    `> 💫 _𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐀𝐑𝐒𝐋𝐀𝐍_ 💫`
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🏭 GENERIC IMAGE COMMAND FACTORY
// ═══════════════════════════════════════════════════════════════════
function createImageCommand({ name, aliases, emoji, title, defaultQuery }) {
  return {
    name,
    aliases,
    async run(ctx) {
      // 🔑 API key check
      if (!CONFIG.UNSPLASH_ACCESS_KEY) {
        return ctx.reply(
          `> ❌ *𝐄𝐑𝐑𝐎𝐑*\n` +
          `> ╰─➤ Unsplash Access Key missing.\n` +
          `> ╰─➤ Add \`UNSPLASH_ACCESS_KEY\` in \`.env\` file.`
        );
      }

      // ⏱️ Cooldown
      if (onCooldown(ctx)) return;
      try { await ctx.react(emoji); } catch { /* ignore */ }

      const userQuery = ctx.args.join(' ').trim();
      const query = userQuery || defaultQuery;

      try {
        // 💾 Cache check — array of images milti hai
        let images = cacheGet(query);

        if (!images) {
          // 🎲 Random page per fetch → variety
          const page = Math.floor(Math.random() * 5) + 1;

          const apiUrl =
            `https://api.unsplash.com/search/photos` +
            `?query=${encodeURIComponent(query)}` +
            `&client_id=${CONFIG.UNSPLASH_ACCESS_KEY}` +
            `&per_page=30` +
            `&page=${page}` +
            `&orientation=portrait` +
            `&content_filter=high`;

          const res = await fetchWithTimeout(apiUrl, 10000);
          if (!res.ok) {
            throw new Error(`Unsplash API error (${res.status})`);
          }
          const data = await res.json();

          if (!data.results || data.results.length === 0) {
            throw new Error(`No pictures found for "${query}"`);
          }

          // 🗂️ Poora array cache karo
          images = data.results.map((r) => ({
            url: r.urls.regular,
            photographer: r.user.name || 'Unknown',
            photographerLink: r.user.links.html || 'https://unsplash.com',
          }));
          cacheSet(query, images);
        }

        // 🎲 HAR CALL pe random pick — same pic repeat nahi
        const image = images[Math.floor(Math.random() * images.length)];

        const caption = buildCaption(
          title,
          query,
          image.photographer,
          image.photographerLink
        );

        await ctx.send({
          image: { url: image.url },
          caption,
          contextInfo: getContextInfo(),
        });

        try { await ctx.react('✅'); } catch { /* ignore */ }
      } catch (err) {
        logger?.error?.(`[IMAGE] ${name} failed: ${err.message}`);
        try { await ctx.react('❌'); } catch { /* ignore */ }

        const errMsg =
          `> ❌ *𝐄𝐑𝐑𝐎𝐑*\n` +
          `> ────────────────\n` +
          `> ⚠️ \`𝐑𝐞𝐚𝐬𝐨𝐧: ${err.message}\`\n` +
          `> ────────────────\n` +
          `> 💫 _𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐀𝐑𝐒𝐋𝐀𝐍_ 💫`;

        await ctx.send({ text: errMsg, contextInfo: getContextInfo() });
      }
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// 📦 COMMANDS
// ═══════════════════════════════════════════════════════════════════

// 🌸 .girl — beautiful women (default), ya custom query
export const girl = createImageCommand({
  name: 'girl',
  aliases: ['girls', 'women', 'woman', 'ladies'],
  emoji: '🌸',
  title: '𝐁𝐄𝐀𝐔𝐓𝐈𝐅𝐔𝐋 𝐖𝐎𝐌𝐄𝐍',
  defaultQuery: 'beautiful woman portrait',
});

// 🌿 .boy — handsome men
export const boy = createImageCommand({
  name: 'boy',
  aliases: ['boys', 'man', 'men', 'handsome'],
  emoji: '🌿',
  title: '𝐇𝐀𝐍𝐃𝐒𝐎𝐌𝐄 𝐌𝐀𝐍',
  defaultQuery: 'handsome man portrait',
});

// 🎌 .anime — anime art
export const anime = createImageCommand({
  name: 'anime',
  aliases: ['animepic', 'animeart'],
  emoji: '🎌',
  title: '𝐀𝐍𝐈𝐌𝐄 𝐀𝐑𝐓',
  defaultQuery: 'anime illustration',
});

// 🏔️ .nature — landscapes
export const nature = createImageCommand({
  name: 'nature',
  aliases: ['nat', 'landscape'],
  emoji: '🏔️',
  title: '𝐍𝐀𝐓𝐔𝐑𝐄',
  defaultQuery: 'nature landscape',
});

// 🚗 .car — sports cars
export const car = createImageCommand({
  name: 'car',
  aliases: ['cars', 'vehicle'],
  emoji: '🚗',
  title: '𝐂𝐀𝐑𝐒',
  defaultQuery: 'sports car',
});

// 🍔 .food — delicious food
export const food = createImageCommand({
  name: 'food',
  aliases: ['foodpic', 'meal'],
  emoji: '🍔',
  title: '𝐅𝐎𝐎𝐃',
  defaultQuery: 'delicious food',
});

// 🖼️ .wallpaper — aesthetic wallpapers
export const wallpaper = createImageCommand({
  name: 'wallpaper',
  aliases: ['wall', 'wp', 'bg'],
  emoji: '🖼️',
  title: '𝐖𝐀𝐋𝐋𝐏𝐀𝐏𝐄𝐑',
  defaultQuery: 'aesthetic wallpaper',
});

// 🔍 .img — custom search (any query)
export const img = createImageCommand({
  name: 'img',
  aliases: ['image', 'photo', 'search', 'pic'],
  emoji: '🔍',
  title: '𝐈𝐌𝐀𝐆𝐄 𝐒𝐄𝐀𝐑𝐂𝐇',
  defaultQuery: 'beautiful scenery',
});
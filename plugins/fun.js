/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎲 FUN.JS — Games & Randomizers (Mobile-Optimized Widths)
 * ═══════════════════════════════════════════════════════════════════
 * All borders and dividers are shortened to fit perfectly on phone screens.
 */

import logger from '../utils/logger.js';
import { cleanJid } from '../utils/helper.js';

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function fetchGif(action) {
  try {
    const res = await fetch(`https://api.waifu.pics/sfw/${action}`);
    const data = await res.json();
    return data.url;
  } catch (err) {
    logger.error(`[Fun] GIF fetch failed for ${action}:`, err.message);
    return null;
  }
}

const TRUTHS = ["What's the most embarrassing thing you've done?", "Have you ever lied to your best friend?", "Who was your first crush?", "What's a secret you've never told anyone?"];
const DARES = ["Send a selfie right now!", "Type a message using only your nose.", "Call the 3rd person in your contacts and say 'I love you'.", "Send a voice note singing a nursery rhyme."];
const EIGHT_BALL = ["Yes, definitely.", "It is certain.", "Without a doubt.", "Most likely.", "Ask again later.", "Cannot predict now.", "Don't count on it.", "My reply is no.", "Very doubtful."];
const JOKES = ["Why don't scientists trust atoms? Because they make up everything!", "I told my wife she was drawing her eyebrows too high. She looked surprised.", "What do you call a fake noodle? An impasta."];
const FACTS = ["Honey never spoils. Archaeologists have found 3000-year-old honey that is still edible.", "Octopuses have three hearts.", "Bananas are berries, but strawberries aren't."];

// ── 11: Kawaii Pastel Style ──
export const truth = {
  name: 'truth', aliases: ['t'],
  async run(ctx) {
    logger.info(`[Command] .truth triggered`);
    await ctx.react('🤫');
    await ctx.reply(`⋆｡°✩ ⋆｡°✩\n  🌸 *TRUTH* 🌸\n⋆｡°✩ ⋆｡°✩\n\n♡ ${getRandom(TRUTHS)}\n\n⋆｡°✩ ⋆｡°✩`);
  }
};

// ── 15: Anime Action Style ──
export const dare = {
  name: 'dare', aliases: ['d'],
  async run(ctx) {
    logger.info(`[Command] .dare triggered`);
    await ctx.react('😈');
    await ctx.reply(`『 ⚡ ARSLAN MDX 』\n━━━━━━━━━━━━━\n卍 *DARE* : ${getRandom(DARES)}\n卍 *MODE* : BEAST\n━━━━━━━━━━━━━`);
  }
};

// ── 6: MacOS Window Style ──
export const eightball = {
  name: '8ball', aliases: ['8b'],
  async run(ctx) {
    logger.info(`[Command] .8ball triggered`);
    const q = ctx.text.replace(/^\.8ball\s*/i, '').trim();
    if (!q) return ctx.reply(`🔴 🟡 🟢  Error\n──────────────\nUsage: .8ball Will I be rich?\n──────────────`);
    
    await ctx.react('🎱');
    await ctx.reply(`🔴 🟡 🟢  ArslanMDX\n──────────────\n❓ *Q:* ${q}\n🎱 *A:* ${getRandom(EIGHT_BALL)}\n──────────────`);
  }
};

// ── 10: Discord Embed Style ──
export const joke = {
  name: 'joke',
  async run(ctx) {
    logger.info(`[Command] .joke triggered`);
    await ctx.react('😂');
    await ctx.reply(`▌ ⚡ *ARSLAN MDX*\n▌ ───────────\n▌ 🤣 *JOKE*\n▌ ${getRandom(JOKES)}\n▌ ───────────`);
  }
};

// ── 16: Vercel Minimalist Style ──
export const fact = {
  name: 'fact',
  async run(ctx) {
    logger.info(`[Command] .fact triggered`);
    await ctx.react('🧠');
    await ctx.reply(`▲ ARSLAN MDX\n──────────────\n● *Fact:*\n● ${getRandom(FACTS)}\n──────────────`);
  }
};

// ── 10: Discord Embed Style (For Roll) ──
export const roll = {
  name: 'roll', aliases: ['dice'],
  async run(ctx) {
    logger.info(`[Command] .roll triggered`);
    const num = Math.floor(Math.random() * 6) + 1;
    await ctx.react('🎲');
    await ctx.reply(`▌ 🎲 *ARSLAN MDX*\n▌ ───────────\n▌ Rolled: *${num}*\n▌ ${['⚀','⚁','⚂','⚃','⚄','⚅'][num - 1]}\n▌ ───────────`);
  }
};

// ── 12: Cloud / Dreamy Style (For Ship) ──
export const ship = {
  name: 'ship', aliases: ['lovecalc'],
  async run(ctx) {
    logger.info(`[Command] .ship triggered`);
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!mentioned) return ctx.reply(`☁️ ｡ﾟ☁︎｡\n⚠️ Reply/Tag someone!\n☁️ ｡ﾟ☁︎｡`);
    
    const percent = Math.floor(Math.random() * 101);
    let comment = percent > 90 ? "Soulmates! 💍" : percent > 70 ? "Love is in the air! 💕" : percent > 50 ? "Good match!" : "Just friends.";
    
    await ctx.react('❤️');
    await ctx.send({
      text: `☁️ ｡ﾟ☁︎｡\n✧ *S H I P* ✧\n☁️ ｡ﾟ☁︎｡\n\n👤 @${ctx.senderNumber}\n👤 @${cleanJid(mentioned)}\n\n💖 Match: *${percent}%*\n✨ ${comment}\n\n☁️ ｡ﾟ☁︎｡`,
      mentions: [ctx.sender, mentioned]
    });
  }
};

// ── 15: Anime Action Style (For Slap) ──
export const slap = {
  name: 'slap', aliases: ['thappad'],
  async run(ctx) {
    logger.info(`[Command] .slap triggered`);
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!mentioned) return ctx.reply(`『 ⚡ ERROR 』\nTag someone to slap!`);

    await ctx.react('🖐️');
    const gifUrl = await fetchGif('slap');
    const text = `『 🖐️ SLAP 』\n━━━━━━━━━━━━━\n卍 *FROM* : @${ctx.senderNumber}\n卍 *TO*   : @${cleanJid(mentioned)}\n━━━━━━━━━━━━━`;
    
    if (gifUrl) await ctx.send({ video: { url: gifUrl }, gifPlayback: true, caption: text, mentions: [ctx.sender, mentioned] });
    else await ctx.send({ text, mentions: [ctx.sender, mentioned] });
  }
};

// ── 11: Kawaii Pastel Style (For Pat) ──
export const pat = {
  name: 'pat',
  async run(ctx) {
    logger.info(`[Command] .pat triggered`);
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!mentioned) return ctx.reply(`⋆｡°✩ ⋆｡°✩\n⚠️ Reply/Tag someone!\n⋆｡°✩ ⋆｡°✩`);

    await ctx.react('🫳');
    const gifUrl = await fetchGif('pat');
    const text = `⋆｡°✩ ⋆｡°✩\n🫳 *P A T* 🫳\n⋆｡°✩ ⋆｡°✩\n\n♡ @${ctx.senderNumber}\n♡ patted @${cleanJid(mentioned)}\n\n⋆｡°✩ ⋆｡°✩`;
    
    if (gifUrl) await ctx.send({ video: { url: gifUrl }, gifPlayback: true, caption: text, mentions: [ctx.sender, mentioned] });
    else await ctx.send({ text, mentions: [ctx.sender, mentioned] });
  }
};
/**
 * ═══════════════════════════════════════════════════════════════════
 * 💖 FUN2.JS — Romance & Love (Mobile-Optimized Widths)
 * ═══════════════════════════════════════════════════════════════════
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
    logger.error(`[Fun2] GIF fetch failed for ${action}:`, err.message);
    return null;
  }
}

function getTarget(ctx) {
  const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
  return mentioned ? cleanJid(mentioned) : cleanJid(ctx.sender);
}

const SHAYARI = [
  "Tumhari aankhon mein jo nasha hai,\nYeh nasha kabhi utarne na dena.",
  "Muhabbat ka matlab sirf tumse hai,\nZindagi ka matlab sirf tumse hai."
];

const FLIRT_LINES = [
  "Kya aap Google hain? Kyunke aap mein woh sab kuch hai jo main dhoondh raha tha.",
  "Agar aap ek candy hoti, toh main aapko chura leta."
];

const WIFE_RESPONSES = [
  "tum meri jaan ho, meri duniya ho! 💖",
  "tumhare bina meri zindagi adhoori hai, meri wife! 👰"
];

// ── 12: Cloud / Dreamy Style (For Wife) ──
export const wife = {
  name: 'wife', aliases: ['biwi', 'merijaan'],
  async run(ctx) {
    logger.info(`[Command] .wife triggered`);
    await ctx.react('👰');
    const response = getRandom(WIFE_RESPONSES);
    await ctx.reply(`☁️ ｡ﾟ☁︎｡\n✧ *W I F E* ✧\n☁️ ｡ﾟ☁︎｡\n\n👰 @${ctx.senderNumber}\n💌 _${response}_\n\n☁️ ｡ﾟ☁︎｡`);
  }
};

// ── 11: Kawaii Pastel Style (For Love) ──
export const love = {
  name: 'love', aliases: ['lovemeter'],
  async run(ctx) {
    logger.info(`[Command] .love triggered`);
    const target = getTarget(ctx);
    const percent = Math.floor(Math.random() * 101);
    let comment = percent > 90 ? "Soulmates! 💍" : percent > 70 ? "Love is in the air! 💕" : "Thoda aur pyar karo! 💔";

    await ctx.react('❤️');
    await ctx.send({
      text: `⋆｡°✩ ⋆｡°✩\n💖 *L O V E* 💖\n⋆｡°✩ ⋆｡°✩\n\n♡ @${ctx.senderNumber}\n♡ @${target}\n\n📊 Score: *${percent}%*\n💬 ${comment}\n\n⋆｡°✩ ⋆｡°✩`,
      mentions: [ctx.sender, `${target}@s.whatsapp.net`]
    });
  }
};

// ── 12: Cloud / Dreamy Style (For Kiss) ──
export const kiss = {
  name: 'kiss', aliases: ['muah', 'pappi'],
  async run(ctx) {
    logger.info(`[Command] .kiss triggered`);
    const target = getTarget(ctx);
    await ctx.react('💋');
    const gifUrl = await fetchGif('kiss');
    
    const text = `☁️ ｡ﾟ☁︎｡\n✧ *K I S S* ✧\n☁️ ｡ﾟ☁︎｡\n\n👤 @${ctx.senderNumber} kissed\n👤 @${target}\n\n☁️ ｡ﾟ☁︎｡`;

    if (gifUrl) await ctx.send({ video: { url: gifUrl }, gifPlayback: true, caption: text, mentions: [ctx.sender, `${target}@s.whatsapp.net`] });
    else await ctx.send({ text, mentions: [ctx.sender, `${target}@s.whatsapp.net`] });
  }
};

// ── 12: Cloud / Dreamy Style (For Cuddle) ──
export const cuddle = {
  name: 'cuddle',
  async run(ctx) {
    logger.info(`[Command] .cuddle triggered`);
    const target = getTarget(ctx);
    await ctx.react('🫂');
    const gifUrl = await fetchGif('cuddle');
    
    const text = `☁️ ｡ﾟ☁︎｡\n✧ *C U D D L E* ✧\n☁️ ｡ﾟ☁︎｡\n\n🫂 @${ctx.senderNumber} cuddled\n🫂 @${target}\n\n☁️ ｡ﾟ☁︎｡`;

    if (gifUrl) await ctx.send({ video: { url: gifUrl }, gifPlayback: true, caption: text, mentions: [ctx.sender, `${target}@s.whatsapp.net`] });
    else await ctx.send({ text, mentions: [ctx.sender, `${target}@s.whatsapp.net`] });
  }
};

// ── 16: Vercel Minimalist Style (For Shayari) ──
export const shayari = {
  name: 'shayari', aliases: ['poetry'],
  async run(ctx) {
    logger.info(`[Command] .shayari triggered`);
    await ctx.react('📜');
    await ctx.reply(`▲ ARSLAN MDX\n──────────────\n● *Shayari*\n\n● ${getRandom(SHAYARI).replace(/\n/g, '\n● ')}\n\n──────────────`);
  }
};

// ── 16: Vercel Minimalist Style (For Flirt) ──
export const flirt = {
  name: 'flirt', aliases: ['pickupline'],
  async run(ctx) {
    logger.info(`[Command] .flirt triggered`);
    await ctx.react('😉');
    await ctx.reply(`▲ ARSLAN MDX\n──────────────\n● *Flirt*\n\n● ${getRandom(FLIRT_LINES)}\n\n──────────────`);
  }
};

// ── 10: Discord Embed Style (For Couple) ──
export const couple = {
  name: 'couple', aliases: ['shipname'],
  async run(ctx) {
    logger.info(`[Command] .couple triggered`);
    const target = getTarget(ctx);
    const senderName = ctx.senderNumber.slice(0, 4);
    const targetName = target.slice(0, 4);
    const coupleName = `${senderName} ❤️ ${targetName}`;

    await ctx.react('👩‍❤️‍👨');
    await ctx.send({
      text: `▌ ⚡ *ARSLAN MDX*\n▌ ───────────\n▌ 👤 @${ctx.senderNumber}\n▌ 👤 @${target}\n▌ 💖 Name: *${coupleName}*\n▌ ───────────`,
      mentions: [ctx.sender, `${target}@s.whatsapp.net`]
    });
  }
};
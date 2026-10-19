/**
 * ═══════════════════════════════════════════════════════════════════
 * 💖 FUN2.JS — Romance, Love & Action Commands (GIFs Included)
 * ═══════════════════════════════════════════════════════════════════
 * Works seamlessly in both Groups and DMs.
 * Uses waifu.pics for SFW GIFs.
 */

import logger from '../utils/logger.js';
import { cleanJid } from '../utils/helper.js';

// ─── Helper: Random item picker ───
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Helper: Fetch GIF from API ───
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

// ─── Helper: Target Resolution (Works in DM & Group) ───
function getTarget(ctx) {
  const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
  // Agar kisi ne tag kiya hai, toh usko target karo. Warna sender ko hi target karo (DM case)
  return mentioned ? cleanJid(mentioned) : cleanJid(ctx.sender);
}

// ═══════════════════════════════════════════════════════════════════
// 📦 DATA ARRAYS
// ═══════════════════════════════════════════════════════════════════
const SHAYARI = [
  "Tumhari aankhon mein jo nasha hai,\nYeh nasha kabhi utarne na dena.",
  "Muhabbat ka matlab sirf tumse hai,\nZindagi ka matlab sirf tumse hai.",
  "Tumse mil kar laga ke jeena kya hai,\nTumse bichar kar laga ke marna kya hai.",
  "Chand ko dekhne ki khwahish nahi karte,\nHum toh bas tumhe dekhne ke aadi hain."
];

const FLIRT_LINES = [
  "Kya aap Google hain? Kyunke aap mein woh sab kuch hai jo main dhoondh raha tha.",
  "Agar aap ek candy hoti, toh main aapko chura leta.",
  "Aapki smile itni pyari hai ke main ise dekh kar bhookh bhool gaya.",
  "Kya aapke paas map hai? Kyunke main aapki aankhon mein kho gaya hoon."
];

const WIFE_RESPONSES = [
  "tum meri jaan ho, meri duniya ho, meri sab kuch ho! 💖",
  "tumhare bina meri zindagi adhoori hai, meri wife! 👰",
  "tum meri brown hair wali ho, meri future wife ho! 💍",
  "tum meri zindagi ka sabse haseen hissa ho! ✨"
];

const PROPOSE_RESPONSES = [
  "Will you be my forever? 💍",
  "Meri zindagi ka hissa bano, meri jaan? 💖",
  "Kya tum meri wife banogi? 👰",
  "Mere sath zindagi bitana chahogi? 🌹"
];

const SIMP_PERCENT = [
  "Tum toh 100% simp ho! 🥺",
  "Bhai, thoda toh sharam karo, 99% simp ho! 😂",
  "Tum toh simp king/queen nikle! 85% simp! 👑",
  "Tum abhi tak single kyun ho? 70% simp! 😜"
];

// ═══════════════════════════════════════════════════════════════════
// 1. WIFE 👰 (Special Command)
// ═══════════════════════════════════════════════════════════════════
export const wife = {
  name: 'wife',
  aliases: ['biwi', 'merijaan'],
  async run(ctx) {
    logger.info(`[Command] .wife triggered by ${ctx.senderNumber}`);
    await ctx.react('👰');
    
    const response = getRandom(WIFE_RESPONSES);
    await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 👰 *WIFE COMMAND*
*│* @${ctx.senderNumber} ${response}
*│*
*╰─────────────────⊷*`);
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2. LOVE 💖 (Love Meter)
// ═══════════════════════════════════════════════════════════════════
export const love = {
  name: 'love',
  aliases: ['lovemeter'],
  async run(ctx) {
    logger.info(`[Command] .love triggered by ${ctx.senderNumber}`);
    const target = getTarget(ctx);
    
    const percent = Math.floor(Math.random() * 101);
    let comment = "Thoda aur pyar karo! 💔";
    if (percent > 30) comment = "Pyari dosti hai! 🤝";
    if (percent > 50) comment = "Achha pyar hai! 💕";
    if (percent > 75) comment = "Bohot pyar hai! 💖";
    if (percent > 95) comment = "Soulmates ho tum dono! 💍";

    await ctx.react('❤️');
    await ctx.send({
      text: `*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 💖 *LOVE METER*
*│* 👤 @${ctx.senderNumber}
*│* 👤 @${target}
*│*
*│* 📊 *Love Score:* ${percent}%
*│* 💬 *Comment:* ${comment}
*│*
*╰─────────────────⊷*`,
      mentions: [ctx.sender, `${target}@s.whatsapp.net`]
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
// 3. KISS 💋 (With GIF)
// ═══════════════════════════════════════════════════════════════════
export const kiss = {
  name: 'kiss',
  aliases: ['muah', 'pappi'],
  async run(ctx) {
    logger.info(`[Command] .kiss triggered by ${ctx.senderNumber}`);
    const target = getTarget(ctx);

    await ctx.react('💋');
    const gifUrl = await fetchGif('kiss');
    
    const text = `*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 💋 *ACTION: KISS*
*│* 👤 @${ctx.senderNumber} kissed @${target}
*│*
*╰─────────────────⊷*`;

    if (gifUrl) {
      await ctx.send({ video: { url: gifUrl }, gifPlayback: true, caption: text, mentions: [ctx.sender, `${target}@s.whatsapp.net`] });
    } else {
      await ctx.send({ text, mentions: [ctx.sender, `${target}@s.whatsapp.net`] });
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 4. HUG 🤗 (With GIF)
// ═══════════════════════════════════════════════════════════════════
export const hug = {
  name: 'hug',
  aliases: ['jhappi'],
  async run(ctx) {
    logger.info(`[Command] .hug triggered by ${ctx.senderNumber}`);
    const target = getTarget(ctx);

    await ctx.react('🤗');
    const gifUrl = await fetchGif('hug');
    
    const text = `*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 🤗 *ACTION: HUG*
*│* 👤 @${ctx.senderNumber} hugged @${target}
*│*
*╰─────────────────⊷*`;

    if (gifUrl) {
      await ctx.send({ video: { url: gifUrl }, gifPlayback: true, caption: text, mentions: [ctx.sender, `${target}@s.whatsapp.net`] });
    } else {
      await ctx.send({ text, mentions: [ctx.sender, `${target}@s.whatsapp.net`] });
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 5. CUDDLE 🫂 (With GIF)
// ═══════════════════════════════════════════════════════════════════
export const cuddle = {
  name: 'cuddle',
  async run(ctx) {
    logger.info(`[Command] .cuddle triggered by ${ctx.senderNumber}`);
    const target = getTarget(ctx);

    await ctx.react('🫂');
    const gifUrl = await fetchGif('cuddle');
    
    const text = `*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 🫂 *ACTION: CUDDLE*
*│* 👤 @${ctx.senderNumber} cuddled @${target}
*│*
*╰─────────────────⊷*`;

    if (gifUrl) {
      await ctx.send({ video: { url: gifUrl }, gifPlayback: true, caption: text, mentions: [ctx.sender, `${target}@s.whatsapp.net`] });
    } else {
      await ctx.send({ text, mentions: [ctx.sender, `${target}@s.whatsapp.net`] });
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 6. SHAYARI 📜
// ═══════════════════════════════════════════════════════════════════
export const shayari = {
  name: 'shayari',
  aliases: ['poetry'],
  async run(ctx) {
    logger.info(`[Command] .shayari triggered by ${ctx.senderNumber}`);
    await ctx.react('📜');
    await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 📜 *ROMANTIC SHAYARI*
*│*
*│* ${getRandom(SHAYARI).replace(/\n/g, '\n*│* ')}
*│*
*╰─────────────────⊷*`);
  }
};

// ═══════════════════════════════════════════════════════════════════
// 7. FLIRT 😉
// ═══════════════════════════════════════════════════════════════════
export const flirt = {
  name: 'flirt',
  aliases: ['pickupline'],
  async run(ctx) {
    logger.info(`[Command] .flirt triggered by ${ctx.senderNumber}`);
    await ctx.react('😉');
    await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 😉 *FLIRT LINE*
*│* ${getRandom(FLIRT_LINES)}
*│*
*╰─────────────────⊷*`);
  }
};

// ═══════════════════════════════════════════════════════════════════
// 8. PROPOSE 💍
// ═══════════════════════════════════════════════════════════════════
export const propose = {
  name: 'propose',
  aliases: ['proposal'],
  async run(ctx) {
    logger.info(`[Command] .propose triggered by ${ctx.senderNumber}`);
    const target = getTarget(ctx);

    await ctx.react('💍');
    await ctx.send({
      text: `*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 💍 *PROPOSAL*
*│* 👤 @${ctx.senderNumber} proposed to @${target}
*│*
*│* 💌 _${getRandom(PROPOSE_RESPONSES)}_
*│*
*╰─────────────────⊷*`,
      mentions: [ctx.sender, `${target}@s.whatsapp.net`]
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
// 9. COUPLE 👩‍❤️‍👨
// ═══════════════════════════════════════════════════════════════════
export const couple = {
  name: 'couple',
  aliases: ['shipname'],
  async run(ctx) {
    logger.info(`[Command] .couple triggered by ${ctx.senderNumber}`);
    const target = getTarget(ctx);
    
    const senderName = ctx.senderNumber.slice(0, 4);
    const targetName = target.slice(0, 4);
    const coupleName = `${senderName} ❤️ ${targetName}`;

    await ctx.react('👩‍❤️‍👨');
    await ctx.send({
      text: `*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 👩‍❤️‍👨 *COUPLE NAME*
*│* 👤 @${ctx.senderNumber}
*│* 👤 @${target}
*│*
*│* 💖 *Couple Name:* ${coupleName}
*│* 💬 _Perfect match!_
*│*
*╰─────────────────⊷*`,
      mentions: [ctx.sender, `${target}@s.whatsapp.net`]
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
// 10. SIMP 🥺
// ═══════════════════════════════════════════════════════════════════
export const simp = {
  name: 'simp',
  async run(ctx) {
    logger.info(`[Command] .simp triggered by ${ctx.senderNumber}`);
    const target = getTarget(ctx);

    await ctx.react('🥺');
    await ctx.send({
      text: `*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 🥺 *SIMP METER*
*│* 👤 @${ctx.senderNumber} for @${target}
*│*
*│* 📊 ${getRandom(SIMP_PERCENT)}
*│*
*╰─────────────────⊷*`,
      mentions: [ctx.sender, `${target}@s.whatsapp.net`]
    });
  }
};
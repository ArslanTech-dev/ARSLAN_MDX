/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎲 FUN.JS — Games, Actions & Randomizers (With GIFs)
 * ═══════════════════════════════════════════════════════════════════
 * Completely self-contained. No external files updated.
 * Uses waifu.pics API for SFW GIFs.
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
    logger.error(`[Fun] GIF fetch failed for ${action}:`, err.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📦 DATA ARRAYS
// ═══════════════════════════════════════════════════════════════════
const TRUTHS = [
  "What's the most embarrassing thing you've done in public?",
  "Have you ever lied to your best friend?",
  "Who was your first crush?",
  "What's a secret you've never told anyone?",
  "Have you ever cheated on a test?"
];

const DARES = [
  "Send a selfie right now!",
  "Type a message using only your nose.",
  "Call the 3rd person in your contacts and say 'I love you'.",
  "Change your WhatsApp status to 'I am a loser' for 1 hour.",
  "Send a voice note singing a nursery rhyme."
];

const EIGHT_BALL = [
  "Yes, definitely.", "It is certain.", "Without a doubt.",
  "Most likely.", "Ask again later.", "Cannot predict now.",
  "Don't count on it.", "My reply is no.", "Very doubtful."
];

const JOKES = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "What do you call a fake noodle? An impasta.",
  "Why did the scarecrow win an award? Because he was outstanding in his field!"
];

const FACTS = [
  "Honey never spoils. Archaeologists have found 3000-year-old honey that is still edible.",
  "Octopuses have three hearts.",
  "Bananas are berries, but strawberries aren't.",
  "A day on Venus is longer than a year on Venus."
];

// ═══════════════════════════════════════════════════════════════════
// 1. TRUTH
// ═══════════════════════════════════════════════════════════════════
export const truth = {
  name: 'truth',
  aliases: ['t'],
  async run(ctx) {
    logger.info(`[Command] .truth triggered by ${ctx.senderNumber}`);
    await ctx.react('🤫');
    await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 🫣 *TRUTH*
*│* ${getRandom(TRUTHS)}
*│*
*╰─────────────────⊷*`);
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2. DARE
// ═══════════════════════════════════════════════════════════════════
export const dare = {
  name: 'dare',
  aliases: ['d'],
  async run(ctx) {
    logger.info(`[Command] .dare triggered by ${ctx.senderNumber}`);
    await ctx.react('😈');
    await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 😈 *DARE*
*│* ${getRandom(DARES)}
*│*
*╰─────────────────⊷*`);
  }
};

// ═══════════════════════════════════════════════════════════════════
// 3. 8BALL
// ═══════════════════════════════════════════════════════════════════
export const eightball = {
  name: '8ball',
  aliases: ['8b'],
  async run(ctx) {
    logger.info(`[Command] .8ball triggered by ${ctx.senderNumber}`);
    const question = ctx.text.replace(/^\.8ball\s*/i, '').trim();
    if (!question) return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*\n*│* ⚠️ *Usage:* .8ball Will I be rich?\n*╰─────────────────⊷*`);
    
    await ctx.react('🎱');
    await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* ❓ *Question:* ${question}
*│* 🎱 *Answer:* ${getRandom(EIGHT_BALL)}
*│*
*╰─────────────────⊷*`);
  }
};

// ═══════════════════════════════════════════════════════════════════
// 4. JOKE
// ═══════════════════════════════════════════════════════════════════
export const joke = {
  name: 'joke',
  async run(ctx) {
    logger.info(`[Command] .joke triggered by ${ctx.senderNumber}`);
    await ctx.react('😂');
    await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 🤣 *JOKE*
*│* ${getRandom(JOKES)}
*│*
*╰─────────────────⊷*`);
  }
};

// ═══════════════════════════════════════════════════════════════════
// 5. FACT
// ═══════════════════════════════════════════════════════════════════
export const fact = {
  name: 'fact',
  async run(ctx) {
    logger.info(`[Command] .fact triggered by ${ctx.senderNumber}`);
    await ctx.react('🧠');
    await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 💡 *FACT*
*│* ${getRandom(FACTS)}
*│*
*╰─────────────────⊷*`);
  }
};

// ═══════════════════════════════════════════════════════════════════
// 6. ROLL
// ═══════════════════════════════════════════════════════════════════
export const roll = {
  name: 'roll',
  aliases: ['dice'],
  async run(ctx) {
    logger.info(`[Command] .roll triggered by ${ctx.senderNumber}`);
    const num = Math.floor(Math.random() * 6) + 1;
    await ctx.react('🎲');
    await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│* 🎲 *Rolled:* ${num}
*│* ${['⚀','⚁','⚂','⚃','⚄','⚅'][num - 1]}
*╰─────────────────⊷*`);
  }
};

// ═══════════════════════════════════════════════════════════════════
// 7. SHIP
// ═══════════════════════════════════════════════════════════════════
export const ship = {
  name: 'ship',
  aliases: ['lovecalc'],
  async run(ctx) {
    logger.info(`[Command] .ship triggered by ${ctx.senderNumber}`);
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    
    if (!mentioned) return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*\n*│* ⚠️ *Usage:* Tag someone or reply to their message.\n*╰─────────────────⊷*`);

    const percent = Math.floor(Math.random() * 101);
    let comment = "Just friends.";
    if (percent > 30) comment = "A little spark!";
    if (percent > 50) comment = "Good match!";
    if (percent > 70) comment = "Love is in the air! 💕";
    if (percent > 90) comment = "Soulmates! 💍";

    await ctx.react('❤️');
    await ctx.send({
      text: `*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 👤 @${ctx.senderNumber}
*│* 👤 @${cleanJid(mentioned)}
*│*
*│* 📊 *Match:* ${percent}%
*│* 💬 *Comment:* ${comment}
*│*
*╰─────────────────⊷*`,
      mentions: [ctx.sender, mentioned]
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
// 8. KISS 💋 (With GIF)
// ═══════════════════════════════════════════════════════════════════
export const kiss = {
  name: 'kiss',
  aliases: ['muah'],
  async run(ctx) {
    logger.info(`[Command] .kiss triggered by ${ctx.senderNumber}`);
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!mentioned) return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*\n*│* ⚠️ *Usage:* Reply to someone or tag them.\n*╰─────────────────⊷*`);

    await ctx.react('💋');
    const gifUrl = await fetchGif('kiss');
    
    const text = `*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 💋 *ACTION: KISS*
*│* 👤 @${ctx.senderNumber} kissed @${cleanJid(mentioned)}
*│*
*╰─────────────────⊷*`;

    if (gifUrl) {
      await ctx.send({ video: { url: gifUrl }, gifPlayback: true, caption: text, mentions: [ctx.sender, mentioned] });
    } else {
      await ctx.send({ text, mentions: [ctx.sender, mentioned] });
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 9. HUG 🤗 (With GIF)
// ═══════════════════════════════════════════════════════════════════
export const hug = {
  name: 'hug',
  async run(ctx) {
    logger.info(`[Command] .hug triggered by ${ctx.senderNumber}`);
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!mentioned) return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*\n*│* ⚠️ *Usage:* Reply to someone or tag them.\n*╰─────────────────⊷*`);

    await ctx.react('🤗');
    const gifUrl = await fetchGif('hug');
    
    const text = `*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 🤗 *ACTION: HUG*
*│* 👤 @${ctx.senderNumber} hugged @${cleanJid(mentioned)}
*│*
*╰─────────────────⊷*`;

    if (gifUrl) {
      await ctx.send({ video: { url: gifUrl }, gifPlayback: true, caption: text, mentions: [ctx.sender, mentioned] });
    } else {
      await ctx.send({ text, mentions: [ctx.sender, mentioned] });
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 10. SLAP 🖐️ (With GIF)
// ═══════════════════════════════════════════════════════════════════
export const slap = {
  name: 'slap',
  aliases: ['thappad'],
  async run(ctx) {
    logger.info(`[Command] .slap triggered by ${ctx.senderNumber}`);
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!mentioned) return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*\n*│* ⚠️ *Usage:* Reply to someone or tag them.\n*╰─────────────────⊷*`);

    await ctx.react('🖐️');
    const gifUrl = await fetchGif('slap');
    
    const text = `*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 🖐️ *ACTION: SLAP*
*│* 👤 @${ctx.senderNumber} slapped @${cleanJid(mentioned)}
*│*
*╰─────────────────⊷*`;

    if (gifUrl) {
      await ctx.send({ video: { url: gifUrl }, gifPlayback: true, caption: text, mentions: [ctx.sender, mentioned] });
    } else {
      await ctx.send({ text, mentions: [ctx.sender, mentioned] });
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 11. PAT 🫳 (With GIF)
// ═══════════════════════════════════════════════════════════════════
export const pat = {
  name: 'pat',
  async run(ctx) {
    logger.info(`[Command] .pat triggered by ${ctx.senderNumber}`);
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!mentioned) return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*\n*│* ⚠️ *Usage:* Reply to someone or tag them.\n*╰─────────────────⊷*`);

    await ctx.react('🫳');
    const gifUrl = await fetchGif('pat');
    
    const text = `*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 🫳 *ACTION: PAT*
*│* 👤 @${ctx.senderNumber} patted @${cleanJid(mentioned)}
*│*
*╰─────────────────⊷*`;

    if (gifUrl) {
      await ctx.send({ video: { url: gifUrl }, gifPlayback: true, caption: text, mentions: [ctx.sender, mentioned] });
    } else {
      await ctx.send({ text, mentions: [ctx.sender, mentioned] });
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 12. RATE
// ═══════════════════════════════════════════════════════════════════
export const rate = {
  name: 'rate',
  async run(ctx) {
    logger.info(`[Command] .rate triggered by ${ctx.senderNumber}`);
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned ? `@${cleanJid(mentioned)}` : `@${ctx.senderNumber}`;
    
    const score = Math.floor(Math.random() * 11);
    const stars = '⭐'.repeat(score) + '✩'.repeat(10 - score);
    
    await ctx.react('📊');
    await ctx.send({
      text: `*╭┈──〔 ARSLAN 𝙼𝙳X 〕─⊷*
*│*
*│* 📊 *Rating:* ${target}
*│* 🌟 *Score:* ${score}/10
*│* ${stars}
*│*
*╰─────────────────⊷*`,
      mentions: mentioned ? [mentioned] : [ctx.sender]
    });
  }
};
/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Reactions
 * ═══════════════════════════════════════════════════════════════════
 * Kiss GIFs | Nekos.best + Waifu.pics Fallback
 */

import logger from '../utils/logger.js';

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

// ═══════════════════════════════════════════════════════════════════
// 1. KISS — Anime Kiss GIF
// ═══════════════════════════════════════════════════════════════════
export const kiss = {
  name: 'kiss',
  aliases: ['animekiss', 'kissgif'],
  async run(ctx) {
    await ctx.react('💋');
    
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned ? `@${mentioned.split('@')[0]}` : `@${ctx.senderNumber}`;

    let gifUrl = null;

    // 🚀 1. Try Nekos.best
    try {
      const res = await fetch('https://nekos.best/api/v2/kiss', {
        signal: AbortSignal.timeout(8000)
      });
      const data = await res.json();
      if (data.results && data.results[0]?.url) {
        gifUrl = data.results[0].url;
      }
    } catch (e) {
      logger.warn(`[ANIME] Nekos.best failed: ${e.message}`);
    }

    // 🚀 2. Fallback to Waifu.pics
    if (!gifUrl) {
      try {
        const res = await fetch('https://api.waifu.pics/sfw/kiss', {
          signal: AbortSignal.timeout(8000)
        });
        const data = await res.json();
        if (data.url) {
          gifUrl = data.url;
        }
      } catch (e) {
        logger.warn(`[ANIME] Waifu.pics failed: ${e.message}`);
      }
    }

    if (!gifUrl) {
      await ctx.react('❌');
      return ctx.reply(`> ❌ *Could not fetch kiss GIF.* Please try again later.`);
    }

    const caption = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋💋 *𝐀𝐍𝐈𝐌𝐄 𝐊𝐈𝐒𝐒*
┇◆┋
┇◆┋👤 ${target} got a kiss!
┇◆┋😘 *Vibe:* Romantic
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

    await ctx.send({
      video: { url: gifUrl },
      gifPlayback: true,
      caption: caption,
      mentions: mentioned ? [mentioned] : [ctx.sender],
      contextInfo: getContextInfo()
    });

    await ctx.react('✅');
  }
};
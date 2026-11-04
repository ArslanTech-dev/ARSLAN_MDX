/**
 * ═══════════════════════════════════════════════════════════════════
 * 💘 FLIRT.JS — ARSLAN MDX Flirty Lines
 * ═══════════════════════════════════════════════════════════════════
 * API: ShizoAPI | Fallback Local Array | Premium Template
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

// 🚀 Fallback Lines (Agar API down ho jaye)
const fallbackFlirts = [
  "Kya aap Google hain? Kyunke aap mein woh sab kuch hai jo main dhoondh raha tha.",
  "Agar aap ek candy hoti, toh main aapko chura leta.",
  "Aapki smile itni pyari hai ke main ise dekh kar bhookh bhool gaya.",
  "Tumse mil kar laga ke jeena kya hai.",
  "Kya aapke paas map hai? Kyunke main aapki aankhon mein kho gaya hoon.",
  "Tumhari aankhon mein jo nasha hai, yeh nasha kabhi utarne na dena."
];

export const flirt = {
  name: 'flirt',
  aliases: ['flirty', 'pickuplines', 'line'],
  async run(ctx) {
    let flirtText = '';
    const shizokeys = 'shizo';

    await ctx.react('💘');

    try {
      // 🚀 1. Fetch from API
      const res = await fetch(`https://shizoapi.onrender.com/api/texts/flirt?apikey=${shizokeys}`, {
          signal: AbortSignal.timeout(8000) // 8 second timeout
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      flirtText = data.result;

      if (!flirtText) throw new Error("API returned empty result");

    } catch (e) {
      logger.warn(`[FLIRT] API failed, using fallback: ${e.message}`);
      // 🚀 2. Fallback to local array if API fails
      flirtText = fallbackFlirts[Math.floor(Math.random() * fallbackFlirts.length)];
    }

    try {
      // 🚀 3. Premium Caption
      const text = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋💘 *𝐅𝐋𝐈𝐑𝐓𝐘 𝐋𝐈𝐍𝐄*
┇◆┋
┇◆┋"${flirtText}"
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

      await ctx.send({ text: text, contextInfo: getContextInfo() });
      await ctx.react('✅');

    } catch (err) {
      logger.error(`[FLIRT] Send Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Failed to send flirt line.*`);
    }
  }
};
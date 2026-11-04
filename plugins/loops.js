/**
 * ═══════════════════════════════════════════════════════════════════
 * 🔄 LOOPS.JS — ARSLAN MDX Loop/Reaction GIFs
 * ═══════════════════════════════════════════════════════════════════
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
// 🛠️ APNI API YAHAN DAALEIN 🛠️
// ═══════════════════════════════════════════════════════════════════
// Neeche wale link ko hata kar apni API ka link daal dein.
// Agar API mein koi key chahiye toh usko bhi link ke aakhir mein laga lein.
const MY_API_URL = https://prexzyapis.com/nsfw/boobs'; 
// Example: const MY_API_URL = 'https://myapi.com/loop?apikey=12345';
// ═══════════════════════════════════════════════════════════════════

export const loops = {
  name: 'loops',
  aliases: ['loop', 'react'], // Agar aap chahein toh yahan aur naam (aliases) add kar sakte hain
  async run(ctx) {
    await ctx.react('🔄');
    
    // Check if someone is mentioned
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned ? `@${mentioned.split('@')[0]}` : `@${ctx.senderNumber}`;

    let gifUrl = null;

    try {
      // 🚀 API Fetch Logic
      const res = await fetch(MY_API_URL, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      
      // 🧠 Smart Extraction: Yeh line har tarah ki API ka data utha legi
      // Chahe API {url: "..."} de, {result: "..."} de, ya {data: {url: "..."}} de.
      gifUrl = data.url || data.result || data.link || data.data?.url || data.data?.result;

      if (!gifUrl) throw new Error("Could not find GIF URL in API response.");

    } catch (err) {
      logger.error(`[LOOPS] API Error: ${err.message}`);
      await ctx.react('❌');
      return ctx.reply(`> ❌ *Failed to fetch loop.*\n> API might be down or invalid.`);
    }

    // 🎨 Premium Caption Design
    const caption = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋🔄 *𝐀𝐍𝐈𝐌𝐄 𝐋𝐎𝐎𝐏*
┇◆┋
┇◆┋👤 ${target} triggered a loop!
┇◆┋✨ *Vibe:* Reaction
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

    try {
      // GIF Send Logic
      await ctx.send({
        video: { url: gifUrl },
        gifPlayback: true,
        caption: caption,
        mentions: mentioned ? [mentioned] : [ctx.sender],
        contextInfo: getContextInfo()
      });

      await ctx.react('✅');
    } catch (err) {
      logger.error(`[LOOPS] Send Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Failed to send media.* The API might have returned an invalid URL.`);
    }
  }
};
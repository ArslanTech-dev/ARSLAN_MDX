/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 IMAGE.JS — ARSLAN MDX Image Fetcher (Unsplash)
 * ═══════════════════════════════════════════════════════════════════
 * Advanced Layout | Country-wise Image Fetching
 */

import { CONFIG } from '../config.js';

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
// 1. GIRL — Fetch beautiful girls by country
// ═══════════════════════════════════════════════════════════════════
export const girl = {
  name: 'girl',
  aliases: ['girls', 'pic', 'unsplash'],
  async run(ctx) {
    // Agar user ne country likha hai (jaise: .girl Japan), warna random
    let country = ctx.args.join(' ') || 'beautiful woman';
    
    // Check karein ke API key majood hai ya nahi
    if (!CONFIG.UNSPLASH_ACCESS_KEY) {
      return ctx.reply(`> ❌ *ERROR*\n> ╰─➤ Unsplash Access Key is missing.\n> ╰─➤ Please add it in \`.env\` file.`);
    }

    await ctx.react('🌸');

    try {
      // API Request to Unsplash
      const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(country)}&client_id=${CONFIG.UNSPLASH_ACCESS_KEY}&per_page=1&orientation=portrait&safe_search=true`;
      
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        throw new Error(`No pictures found for "${country}".`);
      }

      // Extract image details
      const image = data.results[0];
      const imageUrl = image.urls.regular;
      const photographer = image.user.name;
      const photographerLink = image.user.links.html;
      const rawQuery = country.toLowerCase() === 'beautiful woman' ? 'Random Aesthetic' : country;

      // Design Caption
      const caption = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋🌸 *𝐁𝐄𝐀𝐔𝐓𝐈𝐅𝐔𝐋 𝐆𝐈𝐑𝐋*
┇◆┋
┇◆┋🌍 *Search:* ${rawQuery.toUpperCase()}
┇◆┋📸 *By:* ${photographer}
┇◆┋🔗 *Source:* Unsplash
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

      // Send Image
      await ctx.send({
        image: { url: imageUrl },
        caption: caption,
        contextInfo: getContextInfo()
      });

      await ctx.react('✅');

    } catch (err) {
      await ctx.react('❌');
      const errMsg = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋❌ *𝐄𝐑𝐑𝐎𝐑*
┇◆┋
┇◆┋⚠️ *Reason:* ${err.message}
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;
      
      await ctx.send({ text: errMsg, contextInfo: getContextInfo() });
    }
  },
};
/**
 * ═══════════════════════════════════════════════════════════════════
 * 📥 DOWNLOADER.JS — ARSLAN MDX Downloader Commands
 * ═══════════════════════════════════════════════════════════════════
 * Ultra Advanced Layout | Exact Template Style
 */

// 🚀 View Channel Context (Forwarded Style)
const getContextInfo = () => {
  return {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363412450457588@newsletter', // Aapka channel JID
      newsletterName: 'ARSLAN MDX',
      serverMessageId: 143
    }
  };
};

// ═══════════════════════════════════════════════════════════════════
// 1. PLAY — YouTube Audio Downloader
// ═══════════════════════════════════════════════════════════════════
export const play = {
  name: 'play',
  aliases: ['song', 'music', 'ytmp3'],
  async run(ctx) {
    const query = ctx.args.join(' ');
    
    if (!query) {
      return ctx.reply(`> ⚠️ *USAGE*\n> ╰─➤ ${ctx.prefix}play <song name>\n> ╰─➤ Example: ${ctx.prefix}play Kesariya`);
    }

    await ctx.react('⏳');

    try {
      // 🚀 API Call (NexOracle API - returns views, duration, author)
      const res = await fetch(`https://api.nexoracle.com/downloader/yt-play?q=${encodeURIComponent(query)}&apikey=free_key@maher_apis`);
      const data = await res.json();

      if (!data.status || !data.result) {
        throw new Error('Song not found or API error.');
      }

      const { title, author, duration, views, audio } = data.result;

      await ctx.react('✅');

      // ═══════════════════════════════════════════════════════
      // 🎨 EXACT TEMPLATE STYLE
      // ═══════════════════════════════════════════════════════
      const caption = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋🎧 *𝐀𝐔𝐃𝐈𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*
┇◆┋
┇◆┋🎵 *Title:* ${title}
┇◆┋⏱️ *Duration:* ${duration}
┇◆┋👀 *Views:* ${views}
┇◆┋📺 *Author:* ${author}
┇◆┋📥 *Status:* Downloading...
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

      // Send Audio with Template Caption and Context (View Channel)
      await ctx.send({
        audio: { url: audio },
        mimetype: 'audio/mp4',
        fileName: `${title}.mp3`,
        caption: caption,
        contextInfo: getContextInfo()
      });

    } catch (err) {
      await ctx.react('❌');
      
      const errMsg = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋❌ *𝐄𝐑𝐑𝐎𝐑*
┇◆┋
┇◆┋⚠️ *Reason:* ${err.message}
┇◆┋📥 *Status:* Failed
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;
                     
      await ctx.send({ text: errMsg, contextInfo: getContextInfo() });
    }
  },
};
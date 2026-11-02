/**
 * ═══════════════════════════════════════════════════════════════════
 * 📥 DOWNLOADER.JS — ARSLAN MDX Downloader Commands
 * ═══════════════════════════════════════════════════════════════════
 * Powered by @kelvdra/scraper (No API Key Needed)
 */

import { ytmp3, search } from '@kelvdra/scraper';

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

// 🎲 Random Songs (Agar user bina naam ke .play likhe)
const randomSongs = [
  'Admirin You Karan Aujla',
  'Kesariya Brahmastra',
  'Tum Hi Ho Aashiqui 2',
  'Apna Bana Le Bhediya',
  'Heeriye Jasleen Royal',
  'Cheques Shubh',
  'Excuses AP Dhillon',
  'Mi Amor Sharn',
  'Lover Talwinder'
];

export const play = {
  name: 'play',
  aliases: ['song', 'music', 'ytmp3'],
  async run(ctx) {
    let query = ctx.args.join(' ');
    
    // 🎲 Random Search Logic
    if (!query) {
      query = randomSongs[Math.floor(Math.random() * randomSongs.length)];
      await ctx.reply(`> 🎲 *Random Song Selected*\n> ╰─➤ Searching: \`${query}\``);
    }

    await ctx.react('⏳');

    try {
      // 🚀 1. Search the song on YouTube
      const searchResults = await search(query, { limit: 1 });
      
      if (!searchResults || searchResults.length === 0) {
        throw new Error('Song not found.');
      }

      const video = searchResults[0];
      const videoUrl = video.url;
      
      // 🚀 2. Download the audio
      const audioData = await ytmp3(videoUrl);

      if (!audioData || !audioData.dl_url) {
        throw new Error('Failed to download audio.');
      }

      await ctx.react('✅');

      const { title, author, duration, views, dl_url } = audioData;

      // ═══════════════════════════════════════════════════════
      // 🎨 EXACT NAWAZ MD STYLE TEMPLATE
      // ═══════════════════════════════════════════════════════
      const caption = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋🎧 *𝐀𝐔𝐃𝐈𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*
┇◆┋
┇◆┋🎵 *Title:* ${title || 'Unknown'}
┇◆┋⏱️ *Duration:* ${duration || 'Unknown'}
┇◆┋👀 *Views:* ${views || 'N/A'}
┇◆┋📺 *Author:* ${author || 'Unknown'}
┇◆┋📥 *Status:* Downloading...
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

      // 🚀 3. Send the audio file
      await ctx.send({
        audio: { url: dl_url },
        mimetype: 'audio/mp4',
        fileName: `${title || 'audio'}.mp3`,
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
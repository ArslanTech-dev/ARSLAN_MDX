/**
 * ═══════════════════════════════════════════════════════════════════
 * 📥 DOWNLOADER.JS — ARSLAN MDX Downloader Commands
 * ═══════════════════════════════════════════════════════════════════
 * Fixed: @kelvdra/scraper yts + ytmp3 structure with API fallback
 */

import { playmp3, ytmp3, search } from '@kelvdra/scraper';

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

    if (!query) {
      query = randomSongs[Math.floor(Math.random() * randomSongs.length)];
      await ctx.reply(`> 🎲 *Random Song Selected*\n> ╰─➤ Searching: \`${query}\``);
    }

    await ctx.react('⏳');

    let title, author, duration, views, audioUrl;

    try {
      // 🚀 METHOD 1: Try playmp3 (Direct Search + Download)
      try {
        const data = await playmp3(query);
        title = data.title || data.result?.title;
        author = data.author || data.result?.author;
        duration = data.duration || data.result?.duration;
        views = data.views || data.result?.views;
        audioUrl = data.audio || data.dl_url || data.url || data.download_url || data.result?.audio || data.result?.dl_url;
      } catch (e) {
        // Method 1 failed, try Method 2
      }

      // 🚀 METHOD 2: Search + ytmp3
      if (!audioUrl) {
        const searchRes = await search(query);
        
        // Handle both { videos: [...] } and direct array
        const videos = searchRes.videos ? searchRes.videos : (Array.isArray(searchRes) ? searchRes : []);
        if (!videos || videos.length === 0) throw new Error('No search results found.');

        const video = videos[0];
        const videoUrl = video.url || `https://youtube.com/watch?v=${video.videoId}`;
        
        const data = await ytmp3(videoUrl);
        title = data.title || video.title;
        author = data.author || video.author;
        duration = data.duration || video.duration;
        views = data.views || video.views;
        audioUrl = data.audio || data.dl_url || data.url || data.download_url;
      }

      // 🚀 METHOD 3: Fallback to API if both above failed
      if (!audioUrl) {
        const res = await fetch(`https://api.nexoracle.com/downloader/yt-play?q=${encodeURIComponent(query)}&apikey=free_key@maher_apis`);
        const apiData = await res.json();
        if (apiData.status && apiData.result) {
          title = apiData.result.title;
          author = apiData.result.author;
          duration = apiData.result.duration;
          views = apiData.result.views;
          audioUrl = apiData.result.audio;
        }
      }

      if (!audioUrl) throw new Error('Failed to get audio download link.');

      await ctx.react('✅');

      // ═══════════════════════════════════════════════════════
      // 🎨 EXACT ARSLAN MDX STYLE TEMPLATE
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

      await ctx.send({
        audio: { url: audioUrl },
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
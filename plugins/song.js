/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎵 SONG.JS — ARSLAN MDX Advanced Song Downloader
 * ═══════════════════════════════════════════════════════════════════
 * API: QasimDev Loader | Retry Logic | Premium UI
 */

import axios from 'axios';
import yts from 'yt-search';
import logger from '../utils/logger.js';

const DL_API = 'https://api.qasimdev.dpdns.org/api/loaderto/download';
const API_KEY = 'xbps-install-Syu';

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

// 🚀 Helper: Wait function for retry
const wait = (ms) => new Promise(r => setTimeout(r, ms));

// 🚀 Helper: Download with Retry Logic
const downloadWithRetry = async (url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const { data } = await axios.get(DL_API, {
                params: { apiKey: API_KEY, format: 'mp3', url },
                timeout: 120000
            });
            
            if (data?.data?.downloadUrl) return data.data;
            throw new Error('No download URL received.');
            
        } catch (err) {
            if (i === retries - 1) throw err;
            logger.warn(`[SONG] Download attempt ${i + 1} failed, retrying in 5s...`);
            await wait(5000);
        }
    }
    throw new Error('All download attempts failed');
};

export const song = {
    name: 'song',
    aliases: ['music', 'audio', 'mp3', 'play2'],
    async run(ctx) {
        const query = ctx.args.join(' ').trim();
        
        if (!query) {
            return ctx.reply(`> 🎵 *𝐒𝐎𝐍𝐆 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*\n> ╰─➤ Usage: ${ctx.prefix}song <song name | yt link>`);
        }

        await ctx.react('⏳');

        try {
            let video;
            
            // 1. Check if it's a URL or a Search Query
            if (query.includes('youtube.com') || query.includes('youtu.be')) {
                video = { url: query };
            } else {
                const { videos } = await yts(query);
                if (!videos || videos.length === 0) {
                    throw new Error('No results found for your query.');
                }
                video = videos[0];
            }

            // 2. Send Loading Message with Thumbnail
            if (video.thumbnail) {
                const loadingCaption = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋🎶 *𝐒𝐎𝐍𝐆 𝐅𝐎𝐔𝐍𝐃*
┇◆┋
┇◆┋🎵 *Title:* ${video.title || query}
┇◆┋⏱️ *Duration:* ${video.timestamp || 'N/A'}
┇◆┋
┇◆┋⏳ *Status:* Downloading audio...
┇◆┋_(May take up to 30s)_
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

                await ctx.send({
                    image: { url: video.thumbnail },
                    caption: loadingCaption,
                    contextInfo: getContextInfo()
                });
            }

            // 3. Download the audio
            const audio = await downloadWithRetry(video.url);
            
            // 4. Send the final audio file
            await ctx.send({
                audio: { url: audio.downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: `${audio.title || video.title || 'song'}.mp3`,
                ptt: false,
                // Optional: Add a small caption to the audio
                caption: `> 🎵 *${audio.title || video.title || 'Unknown'}*\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`,
                contextInfo: getContextInfo()
            });

            await ctx.react('✅');

        } catch (err) {
            logger.error(`[SONG] Error: ${err.message}`);
            await ctx.react('❌');
            
            const reason = err.response?.status === 408
                ? 'Download timed out. Please try again.'
                : err.message;
                
            await ctx.reply(`> ❌ *Download Failed*\n> ╰─➤ Reason: ${reason}`);
        }
    }
};
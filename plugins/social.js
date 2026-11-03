/**
 * ═══════════════════════════════════════════════════════════════════
 * 📥 SOCIAL.JS — ARSLAN MDX Social Media Downloader
 * ═══════════════════════════════════════════════════════════════════
 * Commands: .tt (TikTok), .insta (Instagram), .fb (Facebook), .yt (YouTube)
 */

import { tiktok, instagram, facebook } from '@xazepysk/scrapers/Download';
import ytdl from '@distube/ytdl-core';
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

// Helper: Generate Caption Template
function generateCaption(platform, title, author, duration) {
  return `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋📥 *𝐒𝐎𝐂𝐈𝐀𝐋 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*
┇◆┋
┇◆┋🌐 *Platform:* ${platform}
┇◆┋🎬 *Title:* ${title || 'Unknown'}
┇◆┋📺 *Author:* ${author || 'Unknown'}
┇◆┋⏱️ *Duration:* ${duration || 'N/A'}
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;
}

// ═══════════════════════════════════════════════════════════════════
// 1. TIKTOK (.tt)
// ═══════════════════════════════════════════════════════════════════
export const tt = {
  name: 'tt',
  aliases: ['tiktok'],
  async run(ctx) {
    const url = ctx.args[0];
    if (!url || !url.includes('tiktok.com')) {
      return ctx.reply(`> ❌ *Please provide a valid TikTok link.*\n> Example: ${ctx.prefix}tt https://vt.tiktok.com/...`);
    }

    await ctx.react('⏳');
    try {
      const data = await tiktok(url);
      
      // Get video URL
      let videoUrl = data.video?.url || data.videoUrl || data.video || data.videoHd || data.videoSd;
      if (Array.isArray(videoUrl)) videoUrl = videoUrl[0];
      
      // If nested structure
      if (data.video && typeof data.video === 'object') {
          videoUrl = data.video.noWatermark || data.video.watermark || data.video.url;
      }
      
      if (!videoUrl) throw new Error('Could not extract video URL.');

      const caption = generateCaption('TikTok', data.title || data.desc, data.author || data.authorName, 'N/A');

      await ctx.send({
        video: { url: videoUrl },
        mimetype: 'video/mp4',
        caption: caption,
        contextInfo: getContextInfo()
      });

      await ctx.react('✅');
    } catch (err) {
      logger.error(`[TikTok] ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *TikTok Error:* ${err.message}`);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2. INSTAGRAM (.insta)
// ═══════════════════════════════════════════════════════════════════
export const insta = {
  name: 'insta',
  aliases: ['ig', 'instagram'],
  async run(ctx) {
    const url = ctx.args[0];
    if (!url || !url.includes('instagram.com')) {
      return ctx.reply(`> ❌ *Please provide a valid Instagram link.*\n> Example: ${ctx.prefix}insta https://www.instagram.com/reel/...`);
    }

    await ctx.react('⏳');
    try {
      const data = await instagram(url);
      
      // Extract media from items
      let mediaUrl = null;
      let isVideo = false;
      
      if (data.media && data.media.length > 0) {
          const item = data.media[0];
          mediaUrl = item.url;
          isVideo = item.type === 'video';
      } else if (data.items && data.items.length > 0) {
          const item = data.items[0];
          mediaUrl = item.url;
          isVideo = item.type === 'video';
      } else if (data.url) {
          mediaUrl = data.url;
          isVideo = true; // Assume video for reels
      }

      if (!mediaUrl) throw new Error('Could not extract media URL.');

      const caption = generateCaption('Instagram', data.title || 'Instagram Post', data.author || 'Unknown', 'N/A');

      if (isVideo) {
          await ctx.send({
            video: { url: mediaUrl },
            mimetype: 'video/mp4',
            caption: caption,
            contextInfo: getContextInfo()
          });
      } else {
          await ctx.send({
            image: { url: mediaUrl },
            caption: caption,
            contextInfo: getContextInfo()
          });
      }

      await ctx.react('✅');
    } catch (err) {
      logger.error(`[Instagram] ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Instagram Error:* ${err.message}`);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 3. FACEBOOK (.fb)
// ═══════════════════════════════════════════════════════════════════
export const fb = {
  name: 'fb',
  aliases: ['facebook'],
  async run(ctx) {
    const url = ctx.args[0];
    if (!url || (!url.includes('facebook.com') && !url.includes('fb.watch'))) {
      return ctx.reply(`> ❌ *Please provide a valid Facebook link.*\n> Example: ${ctx.prefix}fb https://www.facebook.com/watch/...`);
    }

    await ctx.react('⏳');
    try {
      const data = await facebook(url);
      
      // Get video URL (HD preferred)
      let videoUrl = data.hd || data.sd || data.videoUrl || data.video;
      if (Array.isArray(videoUrl)) videoUrl = videoUrl[0];
      if (data.video && typeof data.video === 'object') {
          videoUrl = data.video.hd || data.video.sd || data.video.url;
      }

      if (!videoUrl) throw new Error('Could not extract video URL.');

      const caption = generateCaption('Facebook', data.title || 'Facebook Video', data.author || 'Unknown', 'N/A');

      await ctx.send({
        video: { url: videoUrl },
        mimetype: 'video/mp4',
        caption: caption,
        contextInfo: getContextInfo()
      });

      await ctx.react('✅');
    } catch (err) {
      logger.error(`[Facebook] ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Facebook Error:* ${err.message}`);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 4. YOUTUBE (.yt)
// ═══════════════════════════════════════════════════════════════════
export const yt = {
  name: 'yt',
  aliases: ['ytvideo', 'ytdl'],
  async run(ctx) {
    const url = ctx.args[0];
    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      return ctx.reply(`> ❌ *Please provide a valid YouTube link.*\n> Example: ${ctx.prefix}yt https://youtu.be/...`);
    }

    await ctx.react('⏳');
    try {
      const info = await ytdl.getInfo(url);
      const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
      
      const videoUrl = format.url;
      const title = info.videoDetails.title;
      const author = info.videoDetails.author.name;
      const duration = info.videoDetails.lengthSeconds + ' secs';

      const caption = generateCaption('YouTube', title, author, duration);

      await ctx.send({
        video: { url: videoUrl },
        mimetype: 'video/mp4',
        caption: caption,
        contextInfo: getContextInfo()
      });

      await ctx.react('✅');
    } catch (err) {
      logger.error(`[YouTube] ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *YouTube Error:* ${err.message}`);
    }
  }
};
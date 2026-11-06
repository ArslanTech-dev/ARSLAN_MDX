/**
 * ═══════════════════════════════════════════════════════════════════
 * 💖 LOVE.JS — ARSLAN MDX Love Command
 * ═══════════════════════════════════════════════════════════════════
 */

import { getRealLoveVideoUrl, downloadLoveVideoBuffer } from '../lib/love.js';
import { cleanJid } from '../utils/helper.js';
import logger from '../utils/logger.js';

export const love = {
  name: 'love',
  aliases: ['romance', 'lov', 'romantic'],
  async run(ctx) {
    await ctx.react('💖');

    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    const senderNum = ctx.senderNumber;
    const targetNum = mentioned ? cleanJid(mentioned) : null;

    try {
      // 🚀 1. Get Real HD Video URL
      const videoUrl = await getRealLoveVideoUrl();
      logger.info(`[LOVE] Video URL: ${videoUrl.substring(0, 60)}...`);

      // 🚀 2. Download as Buffer
      const videoBuffer = await downloadLoveVideoBuffer(videoUrl);

      if (!videoBuffer) {
        await ctx.react('❌');
        return ctx.reply(`> ❌ *Failed to download love video.*`);
      }

      // 🎨 3. Premium Caption
      let caption = `> 💖 *L O V E*
> 
> 👤 *From:* @${senderNum}`;

      if (targetNum) {
        caption += `\n> 👤 *To:* ${targetNum}\n> \n> ❤️ _Sending love and warm vibes..._`;
      } else {
        caption += `\n> \n> ❤️ _Sending love and warm vibes..._`;
      }

      caption += `\n\n> © POWERED BY ARSLAN MD`;

      // 🚀 4. Send Video
      await ctx.send({
        video: videoBuffer,
        mimetype: 'video/mp4',
        caption: caption,
        mentions: mentioned ? [ctx.sender, mentioned] : [ctx.sender]
      });

      await ctx.react('✅');

    } catch (err) {
      logger.error(`[LOVE] Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Failed to send love video.*`);
    }
  }
};
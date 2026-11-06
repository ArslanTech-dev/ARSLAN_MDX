/**
 * ═══════════════════════════════════════════════════════════════════
 * 💖 LOVE.JS — ARSLAN MDX Love Command
 * ═══════════════════════════════════════════════════════════════════
 */

import { getLoveVideoBuffer } from '../lib/love.js';
import { cleanJid } from '../utils/helper.js';
import logger from '../utils/logger.js';

export const love = {
  name: 'love',
  aliases: ['romance', 'lov', 'romantic'],
  async run(ctx) {
    await ctx.react('💖');

    // Check if someone is mentioned
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    const senderNum = ctx.senderNumber;
    const targetNum = mentioned ? cleanJid(mentioned) : null;

    try {
      // 🚀 Download the romantic video
      const videoBuffer = await getLoveVideoBuffer();

      if (!videoBuffer) {
        await ctx.react('❌');
        return ctx.reply(`> ❌ *Failed to fetch love video.*`);
      }

      // 🎨 Premium Design Caption
      let caption = `> 💖 *L O V E*
> 
> 👤 *From:* @${senderNum}`;

      if (targetNum) {
        caption += `\n> 👤 *To:* @${targetNum}\n> \n> ❤️ _Sending love and warm vibes..._`;
      } else {
        caption += `\n> \n> ❤️ _Sending love and warm vibes..._`;
      }

      caption += `\n\n> © POWERED BY ARSLAN MD`;

      // 🚀 Send the video
      await ctx.send({
        video: videoBuffer,
        mimetype: 'video/mp4',
        gifPlayback: true,
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
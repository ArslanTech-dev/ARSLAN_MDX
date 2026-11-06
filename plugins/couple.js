/**
 * ═══════════════════════════════════════════════════════════════════
 * 💖 COUPLE.JS — ARSLAN MDX Couple Command (Video Version)
 * ═══════════════════════════════════════════════════════════════════
 */

import { calculateShip, generateCoupleName, getCoupleVideoBuffer } from '../lib/couple.js';
import { cleanJid } from '../utils/helper.js';
import logger from '../utils/logger.js';

export const couple = {
  name: 'couple',
  aliases: ['ship', 'lovecalc', 'couplegoal'],
  async run(ctx) {
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    
    if (!mentioned) {
      return ctx.reply(`> ⚠️ *Usage:* Reply to a message or tag someone.\n> Example: ${ctx.prefix}couple @user`);
    }

    await ctx.react('💖');

    const senderNum = ctx.senderNumber;
    const targetNum = cleanJid(mentioned);
    
    const { percent, comment } = calculateShip();
    const coupleName = generateCoupleName(senderNum, targetNum);

    const caption = `> 💖 *C O U P L E  M E T E R*
> 
> 👤 *User 1:* @${senderNum}
> 👤 *User 2:* @${targetNum}
> 
> 📊 *Match:* ${percent}%
> 💬 *Vibe:* ${comment}
> 🏷️ *Couple Name:* ${coupleName}
> 
> © POWERED BY ARSLAN MD`;

    try {
      // 🚀 Download Video Buffer
      const videoBuffer = await getCoupleVideoBuffer();

      if (videoBuffer) {
        // Send Video with Caption
        await ctx.send({
          video: videoBuffer,
          mimetype: 'video/mp4',
          gifPlayback: true,
          caption: caption,
          mentions: [ctx.sender, mentioned]
        });
      } else {
        // Fallback: Just text if video fails
        await ctx.send({
          text: caption,
          mentions: [ctx.sender, mentioned]
        });
      }
      
      await ctx.react('✅');

    } catch (err) {
      logger.error(`[COUPLE] Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Failed to generate couple.*`);
    }
  }
};
/**
 * ═══════════════════════════════════════════════════════════════════
 * 💖 COUPLE.JS — ARSLAN MDX Couple Command (Video Version)
 * ═══════════════════════════════════════════════════════════════════
 */

import { calculateShip, generateCoupleName, getCoupleVideo } from '../lib/couple.js';
import { cleanJid } from '../utils/helper.js';
import logger from '../utils/logger.js';

export const couple = {
  name: 'couple',
  aliases: ['ship', 'lovecalc', 'couplegoal'],
  async run(ctx) {
    // 1. Check if someone is mentioned or replied
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    
    if (!mentioned) {
      return ctx.reply(`> ⚠️ *Usage:* Reply to a message or tag someone.\n> Example: ${ctx.prefix}couple @user`);
    }

    await ctx.react('💖');

    const senderNum = ctx.senderNumber;
    const targetNum = cleanJid(mentioned);
    
    // 2. Get Data
    const { percent, comment } = calculateShip();
    const coupleName = generateCoupleName(senderNum, targetNum);

    // 3. Premium Design Caption
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
      // 4. Get Romantic Video
      const videoUrl = await getCoupleVideo();

      if (videoUrl) {
        await ctx.send({
          video: { url: videoUrl },
          mimetype: 'video/mp4',
          gifPlayback: true,
          caption: caption,
          mentions: [ctx.sender, mentioned]
        });
      } else {
        // Fallback: Just text if video fetch fails
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
/**
 * ═══════════════════════════════════════════════════════════════════
 * 📸 PROFILE.JS — ARSLAN MDX Profile Picture Commands
 * ═══════════════════════════════════════════════════════════════════
 * Commands: getdp (User), getgdp (Group)
 */

import logger from '../utils/logger.js';
import { cleanJid } from '../utils/helper.js';

// ═══════════════════════════════════════════════════════════════════
// 1. GETDP — User Profile Picture
// ═══════════════════════════════════════════════════════════════════
export const getdp = {
  name: 'getdp',
  aliases: ['dp', 'profilepic', 'getpp'],
  async run(ctx) {
    try {
      let target = ctx.args.join(''); // In case user types a number with spaces
      
      // Check if user was mentioned or replied to
      const contextInfo = ctx.msg.message?.extendedTextMessage?.contextInfo;
      const mentioned = contextInfo?.participant;
      
      if (mentioned) {
        target = mentioned;
      } else if (target) {
        // Clean the number and format as JID
        target = `${target.replace(/\D/g, '')}@s.whatsapp.net`;
      } else {
        // Fallback to sender
        target = ctx.sender;
      }

      await ctx.react('🖼️');
      
      // Fetch DP
      const ppUrl = await ctx.sock.profilePictureUrl(target, 'image').catch(() => null);
      
      // If no DP found
      if (!ppUrl) {
        const name = cleanJid(target);
        return await ctx.send({
          text: `> 👤 *@${name}*
> ❌ DP Private Ya Set Nahi

> © POWERED BY ARSLAN MD`,
          mentions: [target]
        });
      }

      // If DP found
      const name = cleanJid(target);
      const caption = `> 👤 *@${name}*
> 📸 DP Found ✅
> 🔍 Quality: HD

> © POWERED BY ARSLAN MD`;

      await ctx.send({
        image: { url: ppUrl },
        caption: caption,
        mentions: [target]
      });

      await ctx.react('✅');
      logger.info(`[PROFILE] DP sent for ${target}`);

    } catch (err) {
      logger.error(`[PROFILE] getdp failed: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Error:* ${err.message}`);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2. GETGDP — Group Profile Picture
// ═══════════════════════════════════════════════════════════════════
export const getgdp = {
  name: 'getgdp',
  aliases: ['gdp', 'groupdp'],
  async run(ctx) {
    try {
      if (!ctx.isGroup) {
        return ctx.reply(`> ❌ Yeh command sirf group mein kaam karti hai.`);
      }

      await ctx.react('🖼️');

      // Fetch Group DP
      const ppUrl = await ctx.sock.profilePictureUrl(ctx.from, 'image').catch(() => null);

      if (!ppUrl) {
        return ctx.reply(`> ❌ Group DP Set Nahi Ya Private Hai

> © POWERED BY ARSLAN MD`);
      }

      // Get Group Name
      let groupName = 'Unknown Group';
      try {
        const meta = await ctx.sock.groupMetadata(ctx.from);
        groupName = meta.subject;
      } catch (e) {
        // Ignore
      }

      const caption = `> 👥 *Group:* ${groupName}
> 📸 DP Found ✅
> 🔍 Quality: HD

> © POWERED BY ARSLAN MD`;

      await ctx.send({
        image: { url: ppUrl },
        caption: caption
      });

      await ctx.react('✅');
      logger.info(`[PROFILE] Group DP sent for ${ctx.from}`);

    } catch (err) {
      logger.error(`[PROFILE] getgdp failed: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Error:* ${err.message}`);
    }
  }
};
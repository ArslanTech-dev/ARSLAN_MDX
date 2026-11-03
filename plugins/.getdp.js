/**
 * ═══════════════════════════════════════════════════════════════════
 * 📸 GETDP.JS — Ultra Smart Profile Picture Downloader
 * ═══════════════════════════════════════════════════════════════════
 * Supports: Users, Groups, Invite Links, +Sign Numbers, Mentions
 */

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

// Helper: Generate Caption
function generateCaption(targetName, isGroup) {
  return `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋📸 *𝐏𝐑𝐎𝐅𝐈𝐋𝐄 𝐏𝐈𝐂*
┇◆┋
┇◆┋🏷️ *Type:* ${isGroup ? 'Group' : 'User'}
┇◆┋🎯 *Target:* ${targetName}
┇◆┋📥 *Status:* Downloaded ✅
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;
}

// ═══════════════════════════════════════════════════════════════════
// GETDP COMMAND
// ═══════════════════════════════════════════════════════════════════
export const getdp = {
  name: 'getdp',
  aliases: ['dp', 'profilepic', 'getpp'],
  async run(ctx) {
    let targetJid = null;
    let targetName = 'User';
    let isGroupTarget = false;

    // 1. Check for Arguments (Number, JID, or Invite Link)
    if (ctx.args[0]) {
      const arg = ctx.args[0];
      
      // Check if it's a Group Invite Link
      if (arg.includes('chat.whatsapp.com')) {
        try {
          await ctx.react('🔍');
          const code = arg.split('chat.whatsapp.com/')[1];
          const info = await ctx.sock.groupGetInviteInfo(code);
          targetJid = info.id;
          targetName = info.subject || 'Group';
          isGroupTarget = true;
        } catch (e) {
          logger.error(`[GETDP] Failed to resolve invite link: ${e.message}`);
        }
      } 
      // Check if it's a Group JID
      else if (arg.includes('@g.us')) {
        targetJid = arg;
        targetName = 'Group';
        isGroupTarget = true;
      } 
      // Otherwise, assume it's a Phone Number (removes +, spaces, dashes)
      else {
        const cleanNum = arg.replace(/\D/g, '');
        if (cleanNum.length >= 10) {
          targetJid = `${cleanNum}@s.whatsapp.net`;
          targetName = `+${cleanNum}`;
        }
      }
    }

    // 2. Check for Mentions / Reply
    if (!targetJid) {
      const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
      if (mentioned) {
        targetJid = mentioned;
        targetName = `@${mentioned.split('@')[0]}`;
      }
    }

    // 3. Fallback: Current Chat (Group or Sender)
    if (!targetJid) {
      if (ctx.isGroup) {
        targetJid = ctx.from;
        targetName = 'This Group';
        isGroupTarget = true;
      } else {
        targetJid = ctx.sender;
        targetName = `@${ctx.senderNumber}`;
      }
    }

    // If still no target, return error
    if (!targetJid) {
      return ctx.reply(`> ❌ *Please provide a number, link, or tag someone.*`);
    }

    await ctx.react('📸');

    try {
      // 🚀 Fetch Profile Picture
      let ppUrl = null;
      try {
        ppUrl = await ctx.sock.profilePictureUrl(targetJid, 'image');
      } catch (e) {
        // DP is hidden or not set
      }

      if (ppUrl) {
        // ✅ DP Found
        const caption = generateCaption(targetName, isGroupTarget);
        await ctx.send({
          image: { url: ppUrl },
          caption: caption,
          contextInfo: getContextInfo()
        });
        await ctx.react('✅');
      } else {
        // ⚠️ DP Hidden or Not Found
        await ctx.react('❌');
        
        let errorReason = `> ❌ *No profile picture found.*\n> The target might not have a DP or it's hidden by privacy settings.`;
        if (!isGroupTarget && targetJid.endsWith('@s.whatsapp.net')) {
           const [result] = await ctx.sock.onWhatsApp(targetJid).catch(() => [null]);
           if (!result || !result.exists) {
               errorReason = `> ❌ *Number ${targetName} is not registered on WhatsApp.*`;
           }
        }

        await ctx.reply(`${errorReason}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`);
      }

    } catch (error) {
      await ctx.react('❌');
      logger.error(`[GETDP] Error: ${error.message}`);
      await ctx.reply(`> ❌ *Error:* ${error.message}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`);
    }
  }
};
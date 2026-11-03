/**
 * ═══════════════════════════════════════════════════════════════════
 * 📸 GETDP.JS — Profile Picture Downloader
 * ═══════════════════════════════════════════════════════════════════
 * Fetch Display Picture (DP) of any user
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

// ═══════════════════════════════════════════════════════════════════
// GETDP COMMAND
// ═══════════════════════════════════════════════════════════════════
export const getdp = {
  name: 'getdp',
  aliases: ['dp', 'profilepic', 'getpp'],
  async run(ctx) {
    let target = ctx.args[0];
    
    // Agar koi number nahi diya, toh check karein ke kisi ko tag kiya hai ya nahi
    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target && mentioned) {
      target = mentioned;
    }
    
    // Agar tag bhi nahi kiya, toh sender ka hi DP nikal lein
    if (!target) {
      target = ctx.sender;
    }

    // Number ko clean karein (sirf digits rakhein)
    const cleanNum = target.replace(/\D/g, '');
    
    if (!cleanNum) {
      return ctx.reply(`> ❌ *Please provide a valid phone number.*\n> Example: ${ctx.prefix}getdp 923001234567`);
    }

    const jid = `${cleanNum}@s.whatsapp.net`;
    
    // Loading reaction
    await ctx.react('📸');

    try {
      // 🚀 Baileys function to fetch DP
      const ppUrl = await ctx.sock.profilePictureUrl(jid, 'image');
      
      // Caption exactly like the screenshot with ARSLAN MDX branding
      const caption = `> *Profile Pic Downloaded*
> *Successfully* ✅

*User:* ${cleanNum}

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;

      await ctx.send({
        image: { url: ppUrl },
        caption: caption,
        contextInfo: getContextInfo()
      });
      
      await ctx.react('✅');
      
    } catch (error) {
      await ctx.react('❌');
      
      // Agar DP nahi mili ya privacy settings ne block kar diya
      const errMsg = `> ❌ *No profile picture found.*\n> The user might not have a DP or it's hidden by privacy settings.\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳𝚇`;
      ctx.reply(errMsg);
    }
  }
};
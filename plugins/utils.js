/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🛠️ UTILS.JS — ARSLAN MDX · Premium Utility Commands (v5)        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Design: Har CMD ka Alag Style (User Requested)                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { cleanJid } from '../utils/helper.js';
import logger from '../utils/logger.js';

// ─── HELPER: Target (Mention ya Reply wala) nikaalo ───
function getTarget(ctx) {
  try {
    const m = ctx.msg?.message || {};
    const info = m.extendedTextMessage?.contextInfo || m.imageMessage?.contextInfo || m.videoMessage?.contextInfo || null;
    
    if (info?.mentionedJid?.[0]) return info.mentionedJid[0]; // Mention
    if (info?.participant) return info.participant;           // Reply
  } catch (e) {}
  return ctx.sender; // Default (Khud ka)
}

// ═══════════════════════════════════════════════════════════════════
// 1. FULLPP — Custom Design 1
// ═══════════════════════════════════════════════════════════════════
export const fullpp = {
  name: 'fullpp',
  aliases: ['getpp', 'pp'],
  async run(ctx) {
    const target = getTarget(ctx);
    try { await ctx.react('🖼️'); } catch {}

    try {
      const ppUrl = await ctx.sock.profilePictureUrl(target, 'image');
      
      const caption = `╭───〔 🖼️ PROFILE PICTURE 〕───╮\n` +
                      `│ 👤 User : @${cleanJid(target)}\n` +
                      `│ 📸 Quality : Full HD\n` +
                      `│\n` +
                      `╰─── 𓆩 ARSLAN MDX 𓆪 ───╯`;

      await ctx.send({ image: { url: ppUrl }, caption, mentions: [target] });
      try { await ctx.react('✅'); } catch {}
    } catch (err) {
      try { await ctx.react('❌'); } catch {}
      await ctx.reply('> ❌ Profile picture not found or hidden.');
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2. DELETE — Delete ANY message (Own or Others)
// ═══════════════════════════════════════════════════════════════════
export const del = {
  name: 'delete',
  aliases: ['del'],
  async run(ctx) {
    const m = ctx.msg?.message || {};
    const info = m.extendedTextMessage?.contextInfo || m.imageMessage?.contextInfo || m.videoMessage?.contextInfo;
    
    if (!info?.stanzaId) {
      return ctx.reply(`> ❌ *USAGE*\n> ╰─➤ Reply to a message and type .del`);
    }

    try {
      await ctx.react('🗑️');
      
      // Check karo ke kya delete kiya ja raha message bot/owner ka hai?
      const isBotMsg = cleanJid(info.participant) === cleanJid(ctx.botJid) || 
                       cleanJid(info.participant) === cleanJid(ctx.botLid) || 
                       cleanJid(info.participant) === cleanJid(ctx.botNumber);

      const deleteKey = {
        remoteJid: ctx.from,
        fromMe: isBotMsg,
        id: info.stanzaId
      };

      // Agar kisi aur ka message hai, toh participant add karna zaroori hai
      if (!isBotMsg) {
        deleteKey.participant = info.participant;
      }

      // Message Delete Karo
      await ctx.sock.sendMessage(ctx.from, { delete: deleteKey });
      
      // Delete Command Trigger Message ko bhi delete kar do
      try { await ctx.sock.sendMessage(ctx.from, { delete: ctx.msg.key }); } catch {}

      // Custom Design 2
      await ctx.send({ 
        text: `➤ 🗑️ DELETE ➤\n╰─➤ Message deleted successfully!\n╰─➤ ARSLAN MDX` 
      });

    } catch (err) {
      logger.error(`[DELETE] ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *FAILED*\n> ╰─➤ Bot must be admin to delete others messages.`);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 3. JID — Custom Design 3
// ═══════════════════════════════════════════════════════════════════
export const jid = {
  name: 'jid',
  aliases: ['id', 'whois'],
  async run(ctx) {
    const target = getTarget(ctx);
    try { await ctx.react('🆔'); } catch {}
    
    const text = `[ 🆔 USER JID ]\n` +
                 `| 👤 User : @${cleanJid(target)}\n` +
                 `| 🔢 Num : ${cleanJid(target)}\n` +
                 `| 📋 JID : ${target}\n` +
                 `[ ARSLAN MDX ]`;
      
    await ctx.reply(text, { mentions: [target] });
  }
};

// ═══════════════════════════════════════════════════════════════════
// 4. VCARD — Custom Design 4
// ═══════════════════════════════════════════════════════════════════
export const vcard = {
  name: 'vcard',
  aliases: ['contact'],
  async run(ctx) {
    const target = getTarget(ctx);
    try { await ctx.react('📇'); } catch {}

    try {
        const status = await ctx.sock.fetchStatus(target).catch(() => ({}));
        const name = status?.status || `User-${cleanJid(target)}`;

        const vcardStr = 'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            `FN:${name}\n` +
            `TEL;type=CELL;type=VOICE;waid=${cleanJid(target)}:+${cleanJid(target)}\n` +
            'END:VCARD';

        await ctx.send({
            contacts: { 
                displayName: name, 
                contacts: [{ vcard: vcardStr }] 
            }
        });
        
        // Design message separate bhej rahe hain kyunke contacts ke sath caption nahi jata
        const caption = `🌸 📇 VCARD 🌸\n` +
                        `┊ 👤 Contact : ${name}\n` +
                        `┊ 📞 Number : +${cleanJid(target)}\n` +
                        `┊\n` +
                        `╰─ 💫 ARSLAN`;
        await ctx.send({ text: caption });
        
        try { await ctx.react('✅'); } catch {}
    } catch (err) {
        await ctx.reply(`> ❌ Failed to generate vCard.`);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 5. SETPP — Custom Design 5
// ═══════════════════════════════════════════════════════════════════
export const setpp = {
  name: 'setpp',
  aliases: ['setprofile'],
  async run(ctx) {
    if (!ctx.isOwner) return ctx.reply(`> ❌ Owner only command.`);

    const m = ctx.msg?.message || {};
    const info = m.extendedTextMessage?.contextInfo || m.imageMessage?.contextInfo;
    const quoted = info?.quotedMessage;

    if (!quoted || (!quoted.imageMessage && !m.imageMessage)) {
        return ctx.reply(`> ❌ Reply to an image with .setpp`);
    }

    try { await ctx.react('⏳'); } catch {}

    try {
        const media = quoted?.imageMessage || m.imageMessage;
        const stream = await downloadContentFromMessage(media, 'image');
        const chunks = [];
        for await (const c of stream) chunks.push(c);
        const buffer = Buffer.concat(chunks);

        await ctx.sock.updateProfilePicture(ctx.sock.user.id, buffer);
        try { await ctx.react('✅'); } catch {}
        
        const text = `🔥 SETPP 🔥\n` +
                     `──────────────\n` +
                     `✅ Bot DP Updated!\n` +
                     `──────────────\n` +
                     `🔥 ARSLAN MDX 🔥`;
        await ctx.reply(text);
    } catch (err) {
        try { await ctx.react('❌'); } catch {}
        await ctx.reply(`> ❌ Could not update profile picture.`);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 6. CHECKADMIN — Custom Design 6
// ═══════════════════════════════════════════════════════════════════
export const checkadmin = {
  name: 'checkadmin',
  aliases: ['admins', 'isadmin'],
  async run(ctx) {
    if (!ctx.isGroup) return ctx.reply(`> ❌ Group only command.`);
    
    try { await ctx.react('🛡️'); } catch {}
    const target = getTarget(ctx);

    try {
        const meta = await ctx.sock.groupMetadata(ctx.from);
        const isTargetAdmin = meta.participants.some(p => cleanJid(p.id) === cleanJid(target) && p.admin);
        const isBotAdmin = meta.participants.some(p => cleanJid(p.id) === cleanJid(ctx.botJid) && p.admin);

        const text = `👑 🛡️ ADMIN CHECK 👑\n` +
                     `━━━━━━━━━━━━━━\n` +
                     `👤 User : @${cleanJid(target)}\n` +
                     `👑 Is Admin : ${isTargetAdmin ? '✅ YES' : '❌ NO'}\n` +
                     `🤖 Bot Admin : ${isBotAdmin ? '✅ YES' : '❌ NO'}\n` +
                     `━━━━━━━━━━━━━━\n` +
                     `👑 ARSLAN MDX 👑`;
          
        await ctx.reply(text, { mentions: [target] });
    } catch (err) {
        await ctx.reply(`> ❌ Could not fetch group data.`);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 7. RESETLINK — Custom Design 7
// ═══════════════════════════════════════════════════════════════════
export const resetlink = {
  name: 'resetlink',
  aliases: ['revoke'],
  async run(ctx) {
    if (!ctx.isGroup) return ctx.reply(`> ❌ Group only command.`);
    if (!ctx.isOwner && !ctx.isAdmin) return ctx.reply(`> ❌ Admin only command.`);

    try { await ctx.react('🔄'); } catch {}
    try {
        await ctx.sock.groupRevokeInvite(ctx.from);
        
        const text = `✦ ─── 🔄 RESETLINK ─── ✦\n` +
                     `✅ Group link reset ho gaya!\n` +
                     `✦ ───────────── ✦`;
                     
        await ctx.reply(text);
        try { await ctx.react('✅'); } catch {}
    } catch (err) {
        await ctx.reply(`> ❌ Bot must be admin to reset link.`);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 8. GETBIO — Custom Design 8
// ═══════════════════════════════════════════════════════════════════
export const getbio = {
  name: 'getbio',
  aliases: ['bio', 'about'],
  async run(ctx) {
    const target = getTarget(ctx);
    try { await ctx.react('📝'); } catch {}

    try {
        const status = await ctx.sock.fetchStatus(target).catch(() => ({}));
        const bio = status?.status || 'No bio available.';
        
        const text = `📝 USER BIO\n` +
                     `│ 👤 User : @${cleanJid(target)}\n` +
                     `│ 💬 Bio : ${bio}\n` +
                     `│\n` +
                     `│ ─ ARSLAN MDX`;

        await ctx.reply(text, { mentions: [target] });
        try { await ctx.react('✅'); } catch {}
    } catch (err) {
        await ctx.reply(`> ❌ Could not fetch bio.`);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 9. READMORE — Custom Design 9
// ═══════════════════════════════════════════════════════════════════
export const readmore = {
  name: 'readmore',
  aliases: ['rm'],
  async run(ctx) {
    const argsText = ctx.args.join(' ');
    
    if (!argsText.includes('|')) {
        return ctx.reply(`> ❌ *USAGE*\n> ╰─➤ .readmore <Visible Text> | <Hidden Text>`);
    }

    try { await ctx.react('📜'); } catch {}
    
    const [visible, hidden] = argsText.split('|').map(t => t.trim());
    
    // Custom Design 9 (Invisible character trick to hide text)
    const formattedText = `★─── 📜 READ MORE ───★\n` +
                          `${visible}\n\n` +
                          `${'\u200E'.repeat(4000)}` + 
                          `${hidden}\n` +
                          `★─── ARSLAN ───★`;
    
    await ctx.reply(formattedText);
    try { await ctx.react('✅'); } catch {}
  }
};
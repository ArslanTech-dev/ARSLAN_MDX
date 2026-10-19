/**
 * ═══════════════════════════════════════════════════════════════════
 * 🛡️ GROUP.JS — Group Admin & Security Commands
 * ═══════════════════════════════════════════════════════════════════
 * Handles commands like antilink, welcome, kick, promote, etc.
 * Every command prints a log to the console for debugging.
 */

import { getSettings, saveSettings } from '../utils/groupSettings.js';
import { cleanJid } from '../utils/helper.js';
import logger from '../utils/logger.js'; // Import logger for terminal prints

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Checks if the message sender is an Admin or the Bot Owner.
 */
async function checkAdmin(ctx) {
  if (ctx.isOwner) return true; // Owner is always admin
  if (!ctx.isGroup) return false;
  
  try {
    const meta = await ctx.sock.groupMetadata(ctx.from);
    return meta.participants.some(p => 
      cleanJid(p.id) === cleanJid(ctx.sender) && 
      (p.admin === 'admin' || p.admin === 'superadmin')
    );
  } catch (err) {
    logger.error(`[Group] Admin check failed: ${err.message}`);
    return false;
  }
}

/**
 * Checks if the Bot itself is an Admin (needed for kick/promote).
 */
async function checkBotAdmin(ctx) {
  if (!ctx.isGroup) return false;
  try {
    const meta = await ctx.sock.groupMetadata(ctx.from);
    const botJid = ctx.sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
    return meta.participants.some(p => 
      cleanJid(p.id) === cleanJid(botJid) && 
      (p.admin === 'admin' || p.admin === 'superadmin')
    );
  } catch (err) {
    logger.error(`[Group] Bot admin check failed: ${err.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 1. ANTILINK TOGGLE
// ═══════════════════════════════════════════════════════════════════
export const antilink = {
  name: 'antilink',
  aliases: ['al'],
  groupOnly: true,
  async run(ctx) {
    logger.info(`[Command] .antilink triggered by ${ctx.senderNumber}`);

    if (!(await checkAdmin(ctx))) {
      logger.warn(`[Command] .antilink denied: ${ctx.senderNumber} is not admin.`);
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ❌ Access Denied:* Admin Only!\n*╰───────────────⊷*`);
    }
    
    const action = ctx.args[0]?.toLowerCase();
    if (action !== 'on' && action !== 'off') {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ⚠️ Usage:* ${ctx.prefix}antilink [on/off]\n*╰───────────────⊷*`);
    }

    // Update DB
    const settings = await getSettings(ctx.from);
    settings.antilink = action === 'on';
    await saveSettings(ctx.from, settings);

    const statusText = action === 'on' ? '🛡️ Enabled' : '❌ Disabled';
    logger.success(`[Command] Antilink turned ${action} in group ${ctx.from}`);
    
    await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*
*├▢ 🔗 Feature:* Anti-Link
*├▢ ⚙️ Status:* ${statusText}
*├▢ 📝 Action:* ${action === 'on' ? 'Deletes links & warns' : 'Nothing'}
*╰───────────────⊷*`);
  },
};

// ═══════════════════════════════════════════════════════════════════
// 2. WELCOME TOGGLE
// ═══════════════════════════════════════════════════════════════════
export const welcome = {
  name: 'welcome',
  aliases: ['wel'],
  groupOnly: true,
  async run(ctx) {
    logger.info(`[Command] .welcome triggered by ${ctx.senderNumber}`);

    if (!(await checkAdmin(ctx))) {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ❌ Access Denied:* Admin Only!\n*╰───────────────⊷*`);
    }
    
    const action = ctx.args[0]?.toLowerCase();
    if (action !== 'on' && action !== 'off') {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ⚠️ Usage:* ${ctx.prefix}welcome [on/off]\n*╰───────────────⊷*`);
    }

    const settings = await getSettings(ctx.from);
    settings.welcome = action === 'on';
    await saveSettings(ctx.from, settings);

    const statusText = action === 'on' ? '👋 Enabled' : '❌ Disabled';
    logger.success(`[Command] Welcome messages turned ${action} in ${ctx.from}`);
    
    await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*
*├▢ 🎉 Feature:* Welcome Msg
*├▢ ⚙️ Status:* ${statusText}
*╰───────────────⊷*`);
  },
};

// ═══════════════════════════════════════════════════════════════════
// 3. GOODBYE TOGGLE
// ═══════════════════════════════════════════════════════════════════
export const goodbye = {
  name: 'goodbye',
  aliases: ['bye'],
  groupOnly: true,
  async run(ctx) {
    logger.info(`[Command] .goodbye triggered by ${ctx.senderNumber}`);

    if (!(await checkAdmin(ctx))) {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ❌ Access Denied:* Admin Only!\n*╰───────────────⊷*`);
    }
    
    const action = ctx.args[0]?.toLowerCase();
    if (action !== 'on' && action !== 'off') {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ⚠️ Usage:* ${ctx.prefix}goodbye [on/off]\n*╰───────────────⊷*`);
    }

    const settings = await getSettings(ctx.from);
    settings.goodbye = action === 'on';
    await saveSettings(ctx.from, settings);

    const statusText = action === 'on' ? '💔 Enabled' : '❌ Disabled';
    logger.success(`[Command] Goodbye messages turned ${action} in ${ctx.from}`);
    
    await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*
*├▢ 🚪 Feature:* Goodbye Msg
*├▢ ⚙️ Status:* ${statusText}
*╰───────────────⊷*`);
  },
};

// ═══════════════════════════════════════════════════════════════════
// 4. ANTIDELETE TOGGLE (Group Specific)
// ═══════════════════════════════════════════════════════════════════
export const antidelete = {
  name: 'antidelete',
  aliases: ['ad'],
  groupOnly: true,
  async run(ctx) {
    logger.info(`[Command] .antidelete triggered by ${ctx.senderNumber}`);

    if (!(await checkAdmin(ctx))) {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ❌ Access Denied:* Admin Only!\n*╰───────────────⊷*`);
    }
    
    const action = ctx.args[0]?.toLowerCase();
    if (action !== 'on' && action !== 'off') {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ⚠️ Usage:* ${ctx.prefix}antidelete [on/off]\n*╰───────────────⊷*`);
    }

    const settings = await getSettings(ctx.from);
    settings.antidelete = action === 'on';
    await saveSettings(ctx.from, settings);

    const statusText = action === 'on' ? '🗑️ Enabled' : '❌ Disabled';
    logger.success(`[Command] Antidelete turned ${action} in group ${ctx.from}`);
    
    await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*
*├▢ 🛡️ Feature:* Anti-Delete
*├▢ ⚙️ Status:* ${statusText}
*╰───────────────⊷*`);
  },
};

// ═══════════════════════════════════════════════════════════════════
// 5. KICK MEMBER
// ═══════════════════════════════════════════════════════════════════
export const kick = {
  name: 'kick',
  aliases: ['remove'],
  groupOnly: true,
  async run(ctx) {
    logger.info(`[Command] .kick triggered by ${ctx.senderNumber}`);

    if (!(await checkAdmin(ctx))) {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ❌ Access Denied:* Admin Only!\n*╰───────────────⊷*`);
    }
    if (!(await checkBotAdmin(ctx))) {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ❌ Error:* I need to be an Admin.\n*╰───────────────⊷*`);
    }

    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!mentioned) {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ⚠️ Usage:* Reply to a user's message or tag them.\n*╰───────────────⊷*`);
    }

    try {
      await ctx.sock.groupParticipantsUpdate(ctx.from, [mentioned], 'remove');
      logger.success(`[Command] Kicked ${cleanJid(mentioned)} from ${ctx.from}`);
      
      await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ 👢 Action:* Kicked\n*├▢ 👤 User:* @${cleanJid(mentioned)}\n*╰───────────────⊷*`, { mentions: [mentioned] });
    } catch (error) {
      logger.error(`[Command] Failed to kick user: ${error.message}`);
      await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ❌ Error:* Could not kick user. Check my permissions.\n*╰───────────────⊷*`);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
// 6. PROMOTE MEMBER
// ═══════════════════════════════════════════════════════════════════
export const promote = {
  name: 'promote',
  aliases: ['admin'],
  groupOnly: true,
  async run(ctx) {
    logger.info(`[Command] .promote triggered by ${ctx.senderNumber}`);

    if (!(await checkAdmin(ctx))) {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ❌ Access Denied:* Admin Only!\n*╰───────────────⊷*`);
    }
    if (!(await checkBotAdmin(ctx))) {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ❌ Error:* I need to be an Admin.\n*╰───────────────⊷*`);
    }

    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!mentioned) {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ⚠️ Usage:* Reply to a user's message or tag them.\n*╰───────────────⊷*`);
    }

    try {
      await ctx.sock.groupParticipantsUpdate(ctx.from, [mentioned], 'promote');
      logger.success(`[Command] Promoted ${cleanJid(mentioned)} in ${ctx.from}`);
      
      await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ 👑 Action:* Promoted to Admin\n*├▢ 👤 User:* @${cleanJid(mentioned)}\n*╰───────────────⊷*`, { mentions: [mentioned] });
    } catch (error) {
      logger.error(`[Command] Failed to promote user: ${error.message}`);
      await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ❌ Error:* Could not promote user.\n*╰───────────────⊷*`);
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
// 7. DEMOTE MEMBER
// ═══════════════════════════════════════════════════════════════════
export const demote = {
  name: 'demote',
  aliases: ['unadmin'],
  groupOnly: true,
  async run(ctx) {
    logger.info(`[Command] .demote triggered by ${ctx.senderNumber}`);

    if (!(await checkAdmin(ctx))) {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ❌ Access Denied:* Admin Only!\n*╰───────────────⊷*`);
    }
    if (!(await checkBotAdmin(ctx))) {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ❌ Error:* I need to be an Admin.\n*╰───────────────⊷*`);
    }

    const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!mentioned) {
      return ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ⚠️ Usage:* Reply to a user's message or tag them.\n*╰───────────────⊷*`);
    }

    try {
      await ctx.sock.groupParticipantsUpdate(ctx.from, [mentioned], 'demote');
      logger.success(`[Command] Demoted ${cleanJid(mentioned)} in ${ctx.from}`);
      
      await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ 📉 Action:* Demoted\n*├▢ 👤 User:* @${cleanJid(mentioned)}\n*╰───────────────⊷*`, { mentions: [mentioned] });
    } catch (error) {
      logger.error(`[Command] Failed to demote user: ${error.message}`);
      await ctx.reply(`*╭┈──〔 ARSLAN 𝙼𝙳X〕─⊷*\n*├▢ ❌ Error:* Could not demote user.\n*╰───────────────⊷*`);
    }
  },
};
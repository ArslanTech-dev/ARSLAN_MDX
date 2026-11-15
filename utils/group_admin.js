/**
 * ═══════════════════════════════════════════════════════════════════
 * 📦 GROUP_ADMIN.js — ARSLAN MDX Plugin
 * Group admin controls
 * Commands (7): kick, promote, demote, add, mute, unmute, revoke
 * ═══════════════════════════════════════════════════════════════════
 */

import { cleanJid } from '../utils/helper.js';
import { isUserAdmin, isBotAdminIn, collectSenderIds, getTargetJid } from '../utils/groupHelper.js';

const box = (title, content) => {
    const lines = content.split('\n').map(l => `│ ${l}`).join('\n');
    return `╭─〔 *${title.toUpperCase()}* 〕─╮\n${lines}\n╰───────────────────╯\n\n> © POWERED BY ARSLAN MD`;
};

async function isAdmin(ctx) {
    if (ctx.isOwner) return true;
    if (!ctx.isGroup) return false;
    // LID-safe: sender ki saari identities (PN + LID) group admins se match hoti hain
    return isUserAdmin(ctx.sock, ctx.from, collectSenderIds(ctx.msg, ctx.sender));
}

async function isBotAdmin(ctx) {
    if (!ctx.isGroup) return false;
    // LID-safe: bot ki PN aur LID dono se match hota hai
    return isBotAdminIn(ctx.sock, ctx.from);
}

export const kick = {
    name: 'kick',
    aliases: ['remove'],
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        if (!(await isBotAdmin(ctx))) return ctx.reply(`> ❌ I need to be Admin!`);
        
        const target = getTargetJid(ctx.msg);
        if (!target) return ctx.reply(`> ⚠️ Reply to a message or tag someone.`);

        await ctx.react('👢');
        await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'remove');
        
        await ctx.send({
            text: box('Kicked', `👤 User: @${cleanJid(target)}\n📁 Status: Removed`),
            mentions: [target]
        });
    }
};

export const promote = {
    name: 'promote',
    aliases: ['admin'],
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        if (!(await isBotAdmin(ctx))) return ctx.reply(`> ❌ I need to be Admin!`);
        
        const target = getTargetJid(ctx.msg);
        if (!target) return ctx.reply(`> ⚠️ Reply to a message or tag someone.`);

        await ctx.react('👑');
        await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'promote');
        
        await ctx.send({
            text: box('Promoted', `👤 User: @${cleanJid(target)}\n👑 Status: Now an Admin`),
            mentions: [target]
        });
    }
};

export const demote = {
    name: 'demote',
    aliases: ['unadmin'],
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        if (!(await isBotAdmin(ctx))) return ctx.reply(`> ❌ I need to be Admin!`);
        
        const target = getTargetJid(ctx.msg);
        if (!target) return ctx.reply(`> ⚠️ Reply to a message or tag someone.`);

        await ctx.react('📉');
        await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'demote');
        
        await ctx.send({
            text: box('Demoted', `👤 User: @${cleanJid(target)}\n📉 Status: Admin Removed`),
            mentions: [target]
        });
    }
};

export const add = {
    name: 'add',
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        if (!(await isBotAdmin(ctx))) return ctx.reply(`> ❌ I need to be Admin!`);
        
        const number = ctx.args[0];
        if (!number) return ctx.reply(`> ⚠️ Usage: ${ctx.prefix}add 923xxxxxxxxx`);
        
        const jid = `${number.replace(/\D/g, '')}@s.whatsapp.net`;
        await ctx.react('➕');
        
        try {
            await ctx.sock.groupParticipantsUpdate(ctx.from, [jid], 'add');
            await ctx.send({
                text: box('Added', `👤 User: @${cleanJid(jid)}\n✅ Status: Added to group`),
                mentions: [jid]
            });
        } catch (e) {
            await ctx.reply(`> ❌ Failed to add user. (Privacy settings might block it)`);
        }
    }
};

export const mute = {
    name: 'mute',
    aliases: ['end'],
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        if (!(await isBotAdmin(ctx))) return ctx.reply(`> ❌ I need to be Admin!`);
        await ctx.react('🔇');
        
        await ctx.sock.groupSettingUpdate(ctx.from, 'announcement');
        await ctx.reply(box('Group Muted', '🔇 Only admins can send messages now.'));
    }
};

export const unmute = {
    name: 'unmute',
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        if (!(await isBotAdmin(ctx))) return ctx.reply(`> ❌ I need to be Admin!`);
        await ctx.react('🔊');
        
        await ctx.sock.groupSettingUpdate(ctx.from, 'not_announcement');
        await ctx.reply(box('Group Unmuted', '🔊 Everyone can chat now.'));
    }
};

export const revoke = {
    name: 'revoke',
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        await ctx.react('🔄');
        
        const code = await ctx.sock.groupRevokeInvite(ctx.from);
        const link = `https://chat.whatsapp.com/${code}`;
        await ctx.reply(box('Link Revoked', `🔄 New Link:\n${link}`));
    }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * 📦 GROUP_SETTINGS.js — ARSLAN MDX Plugin
 * Group link / join / leave / name / description / picture
 * Commands (6): invite, join, leave, updategname, updategdesc, gcpp
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

export const invite = {
    name: 'invite',
    aliases: ['link'],
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        await ctx.react('🔗');
        
        const code = await ctx.sock.groupInviteCode(ctx.from);
        const link = `https://chat.whatsapp.com/${code}`;
        await ctx.reply(box('Group Link', link));
    }
};

export const join = {
    name: 'join',
    async run(ctx) {
        const link = ctx.args[0];
        if (!link || !link.includes('chat.whatsapp.com')) return ctx.reply(`> ⚠️ Usage: ${ctx.prefix}join group_link`);
        
        await ctx.react('🔗');
        try {
            const code = link.split('https://chat.whatsapp.com/')[1];
            await ctx.sock.groupAcceptInvite(code);
            await ctx.reply(box('Joined', '✅ Successfully joined the group.'));
        } catch (e) {
            await ctx.reply(`> ❌ Failed to join: ${e.message}`);
        }
    }
};

export const leave = {
    name: 'leave',
    aliases: ['out'],
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        await ctx.react('🚪');
        await ctx.reply(box('Goodbye', '👋 Leaving the group...'));
        await ctx.sock.groupLeave(ctx.from);
    }
};

export const updategname = {
    name: 'updategname',
    aliases: ['setgcname'],
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        if (!(await isBotAdmin(ctx))) return ctx.reply(`> ❌ I need to be Admin!`);
        
        const name = ctx.args.join(' ');
        if (!name) return ctx.reply(`> ⚠️ Usage: ${ctx.prefix}updategname New Name`);
        
        await ctx.react('📝');
        await ctx.sock.groupUpdateSubject(ctx.from, name);
        await ctx.reply(box('Name Updated', `✅ New Name: ${name}`));
    }
};

export const updategdesc = {
    name: 'updategdesc',
    aliases: ['setgcdesc'],
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        if (!(await isBotAdmin(ctx))) return ctx.reply(`> ❌ I need to be Admin!`);
        
        const desc = ctx.args.join(' ');
        if (!desc) return ctx.reply(`> ⚠️ Usage: ${ctx.prefix}updategdesc New Description`);
        
        await ctx.react('📝');
        await ctx.sock.groupUpdateDescription(ctx.from, desc);
        await ctx.reply(box('Description Updated', '✅ Group description changed.'));
    }
};

export const gcpp = {
    name: 'gcpp',
    aliases: [],
    groupOnly: true,
    async run(ctx) {
        await ctx.react('📸');
        try {
            const ppUrl = await ctx.sock.profilePictureUrl(ctx.from, 'image');
            await ctx.send({ image: { url: ppUrl }, caption: `> © POWERED BY ARSLAN MD` });
        } catch {
            await ctx.reply(`> ❌ No Group DP set or it's private.`);
        }
    }
};

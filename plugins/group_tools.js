/**
 * ═══════════════════════════════════════════════════════════════════
 * 📦 GROUP_TOOLS.js — ARSLAN MDX Plugin
 * Group tagging & info tools
 * Commands (5): tagall, hidetag, tagadmins, poll, ginfo
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

export const tagall = {
    name: 'tagall',
    aliases: ['everyone'],
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        await ctx.react('📢');
        
        const meta = await ctx.sock.groupMetadata(ctx.from);
        const participants = meta.participants.map(p => p.id);
        const msgText = ctx.args.join(' ') || 'Attention Everyone!';
        
        let mentionsList = participants.map(p => `@${cleanJid(p)}`).join(' ');
        
        await ctx.send({
            text: `> 📢 *ANNOUNCEMENT*\n> \n> ${msgText}\n\n${mentionsList}\n\n> © POWERED BY ARSLAN MD`,
            mentions: participants
        });
    }
};

export const hidetag = {
    name: 'hidetag',
    aliases: ['htag'],
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        await ctx.react('🫥');
        
        const text = ctx.args.join(' ') || 'Hello Everyone';
        const meta = await ctx.sock.groupMetadata(ctx.from);
        const participants = meta.participants.map(p => p.id);
        
        await ctx.send({ text: `> ${text}\n\n> © POWERED BY ARSLAN MD`, mentions: participants });
    }
};

export const tagadmins = {
    name: 'tagadmins',
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        await ctx.react('👮');
        
        const meta = await ctx.sock.groupMetadata(ctx.from);
        const admins = meta.participants.filter(p => p.admin).map(p => p.id);
        if (admins.length === 0) return ctx.reply(`> ❌ No admins found.`);
        
        let mentionsList = admins.map(a => `@${cleanJid(a)}`).join(' ');
        await ctx.send({
            text: box('Admins', `Please check the chat!\n\n${mentionsList}`),
            mentions: admins
        });
    }
};

export const poll = {
    name: 'poll',
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        
        const args = ctx.args.join(' ');
        const parts = args.split('|');
        if (parts.length < 3) return ctx.reply(`> ⚠️ Usage: ${ctx.prefix}poll Question | option1 | option2`);
        
        const question = parts[0].trim();
        const options = parts.slice(1).map(s => s.trim());
        
        await ctx.send({
            poll: { name: question, values: options, selectableCount: 1 }
        });
    }
};

export const ginfo = {
    name: 'ginfo',
    aliases: ['groupinfo'],
    groupOnly: true,
    async run(ctx) {
        await ctx.react('ℹ️');
        const meta = await ctx.sock.groupMetadata(ctx.from);
        const admins = meta.participants.filter(p => p.admin).length;
        
        const content = `📝 Name: ${meta.subject}\n👥 Members: ${meta.participants.length}\n👑 Admins: ${admins}\n📅 Created: ${new Date(meta.creation * 1000).toLocaleDateString()}`;
        await ctx.reply(box('Group Info', content));
    }
};

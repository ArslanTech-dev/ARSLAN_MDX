/**
 * ═══════════════════════════════════════════════════════════════════
 * 🛡️ GROUP.JS — ARSLAN MDX Group Management
 * ═══════════════════════════════════════════════════════════════════
 */

import { CONFIG } from '../config.js';
import { cleanJid } from '../utils/helper.js';
import logger from '../utils/logger.js';

// ─── Helpers ──────────────────────────────────
const box = (title, content) => {
    const lines = content.split('\n').map(l => `│ ${l}`).join('\n');
    return `╭─〔 *${title.toUpperCase()}* 〕─╮\n${lines}\n╰───────────────────╯\n\n> © POWERED BY ARSLAN MD`;
};

async function isAdmin(ctx) {
    if (ctx.isOwner) return true;
    if (!ctx.isGroup) return false;
    try {
        const meta = await ctx.sock.groupMetadata(ctx.from);
        return meta.participants.some(p => cleanJid(p.id) === cleanJid(ctx.sender) && p.admin);
    } catch { return false; }
}

async function isBotAdmin(ctx) {
    if (!ctx.isGroup) return false;
    try {
        const meta = await ctx.sock.groupMetadata(ctx.from);
        const botJid = ctx.sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
        return meta.participants.some(p => cleanJid(p.id) === cleanJid(botJid) && p.admin);
    } catch { return false; }
}

// ═══════════════════════════════════════════════════════════════════
// 1. TAGALL
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 2. KICK
// ═══════════════════════════════════════════════════════════════════
export const kick = {
    name: 'kick',
    aliases: ['remove'],
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        if (!(await isBotAdmin(ctx))) return ctx.reply(`> ❌ I need to be Admin!`);
        
        const target = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
        if (!target) return ctx.reply(`> ⚠️ Reply to a message or tag someone.`);

        await ctx.react('👢');
        await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'remove');
        
        await ctx.send({
            text: box('Kicked', `👤 User: @${cleanJid(target)}\n📁 Status: Removed`),
            mentions: [target]
        });
    }
};

// ═══════════════════════════════════════════════════════════════════
// 3. PROMOTE
// ═══════════════════════════════════════════════════════════════════
export const promote = {
    name: 'promote',
    aliases: ['admin'],
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        if (!(await isBotAdmin(ctx))) return ctx.reply(`> ❌ I need to be Admin!`);
        
        const target = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
        if (!target) return ctx.reply(`> ⚠️ Reply to a message or tag someone.`);

        await ctx.react('👑');
        await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'promote');
        
        await ctx.send({
            text: box('Promoted', `👤 User: @${cleanJid(target)}\n👑 Status: Now an Admin`),
            mentions: [target]
        });
    }
};

// ═══════════════════════════════════════════════════════════════════
// 4. DEMOTE
// ═══════════════════════════════════════════════════════════════════
export const demote = {
    name: 'demote',
    aliases: ['unadmin'],
    groupOnly: true,
    async run(ctx) {
        if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);
        if (!(await isBotAdmin(ctx))) return ctx.reply(`> ❌ I need to be Admin!`);
        
        const target = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
        if (!target) return ctx.reply(`> ⚠️ Reply to a message or tag someone.`);

        await ctx.react('📉');
        await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'demote');
        
        await ctx.send({
            text: box('Demoted', `👤 User: @${cleanJid(target)}\n📉 Status: Admin Removed`),
            mentions: [target]
        });
    }
};

// ═══════════════════════════════════════════════════════════════════
// 5. HIDETAG
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 6. TAGADMINS
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 7. GINFO
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 8. ADD
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 9. INVITE / LINK
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 10. JOIN
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 11. LEAVE / OUT
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 12. MUTE / END
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 13. UNMUTE
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 14. REVOKE
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 15. POLL
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 16. UPDATE GROUP NAME
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 17. UPDATE GROUP DESC
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 18. GET GROUP DP (GCPP)
// ═══════════════════════════════════════════════════════════════════
export const gcpp = {
    name: 'gcpp',
    aliases: ['groupdp'],
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
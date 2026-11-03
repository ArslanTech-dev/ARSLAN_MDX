/**
 * ═══════════════════════════════════════════════════════════════════
 * 👻 GHOST.JS — ARSLAN MD Ghost Mode & Prank
 * ═══════════════════════════════════════════════════════════════════
 * Hides blue ticks, online status, and typing indicator.
 * Includes a creepy auto-reply for the ultimate prank!
 */

import { readDb, writeDb } from '../utils/database.js';
import logger from '../utils/logger.js';

// Track patched sockets
const patchedSockets = new WeakSet();

// 🚀 Function to make the bot invisible (The Prank Logic)
function applyGhostMode(sock) {
    if (patchedSockets.has(sock)) return;
    
    // Save original functions
    sock._origReadMessages = sock.readMessages;
    sock._origSendPresenceUpdate = sock.sendPresenceUpdate;

    // 1. Disable Blue Ticks (Read Receipts)
    sock.readMessages = async () => {
        // Do nothing! No blue ticks.
    };

    // 2. Disable Online & Typing Status
    sock.sendPresenceUpdate = async (status, jid) => {
        // Only allow 'unavailable'. Ignore 'available', 'composing', 'recording'.
        if (status === 'unavailable') {
            return sock._origSendPresenceUpdate.call(sock, 'unavailable', jid);
        }
        return Promise.resolve();
    };

    // Force offline immediately
    sock._origSendPresenceUpdate.call(sock, 'unavailable').catch(() => {});
    
    patchedSockets.add(sock);
    logger.info(`[GHOST] Prank mode activated. Bot is now invisible.`);
}

// 🚀 Function to restore normal mode
function removeGhostMode(sock) {
    if (!patchedSockets.has(sock)) return;
    
    // Restore original functions
    if (sock._origReadMessages) sock.readMessages = sock._origReadMessages;
    if (sock._origSendPresenceUpdate) sock.sendPresenceUpdate = sock._origSendPresenceUpdate;
    
    // Force online immediately
    if (sock.sendPresenceUpdate) sock.sendPresenceUpdate('available').catch(() => {});
    
    patchedSockets.delete(sock);
    logger.info(`[GHOST] Prank mode deactivated. Bot is visible.`);
}

export const ghost = {
    name: 'ghost',
    aliases: ['prank', 'invisible'],
    ownerOnly: true, // Sirf aap chala sakte hain
    async run(ctx) {
        const action = ctx.args[0]?.toLowerCase();
        const db = await readDb();

        if (!db.global_settings) db.global_settings = {};

        if (action === 'on') {
            db.global_settings.ghostMode = true;
            await writeDb(db);
            
            // Apply the stealth interceptors
            applyGhostMode(ctx.sock);
            
            const text = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳 𝙶𝙷𝙾𝚂𝚃   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋👻 *𝐆𝐇𝐎𝐒𝐓 𝐏𝐑𝐀𝐍𝐊: 𝐎𝐍*
┇◆┋
┇◆┋The bot is now invisible.
┇◆┋Ab dost message karega toh:
┇◆┋
┇◆┋❌ Blue Tick disabled
┇◆┋❌ Online disabled
┇◆┋❌ Typing disabled
┇◆┋✅ But bot is online!
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`;
            await ctx.reply(text);
            
        } else if (action === 'off') {
            db.global_settings.ghostMode = false;
            await writeDb(db);
            
            // Remove the interceptors
            removeGhostMode(ctx.sock);
            
            const text = `*╭─❍══ ⃟ ⃟ ⃟   𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳 𝙶𝙷𝙾𝚂𝚃   ⃟ ⃟ ⃟══⊷❍*
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈⊷
┇◆┋👁️ *𝐆𝐇𝐎𝐒𝐓 𝐏𝐑𝐀𝐍𝐊: 𝐎𝐅𝐅*
┇◆┋
┇◆┋The bot is visible again.
┇◆┋
┇◆┋✅ Blue Ticks Enabled
┇◆┋✅ Online Status Enabled
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`;
            await ctx.reply(text);
            
        } else {
            const currentState = db.global_settings.ghostMode ? 'ON 👻' : 'OFF 👁️';
            const text = `> 👻 *ARSLAN MD GHOST MODE*\n\n` +
                         `> Current Status: *${currentState}*\n\n` +
                         `> Usage:\n` +
                         `> ▸ ${ctx.prefix}ghost on\n` +
                         `> ▸ ${ctx.prefix}ghost off`;
            await ctx.reply(text);
        }
    }
};
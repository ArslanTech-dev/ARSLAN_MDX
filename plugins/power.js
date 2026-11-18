/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ⚡ POWER.JS — ARSLAN MDX · Cyberpunk System Control             ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Commands: power (menu), shutdown, reboot, start                 ║
 * ║  Features: Native Buttons + Live Terminal Animation (Edit)       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { generateMessageID } from '@whiskeysockets/baileys';
import logger from '../utils/logger.js';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// ═══════════════════════════════════════════════════════════════════
// 🎬 LIVE ANIMATION FUNCTION (Edits same message for loading effect)
// ═══════════════════════════════════════════════════════════════════
async function runTerminalAnimation(ctx, type) {
    let msg = null;
    
    // Animation Frames
    let frames = [];
    if (type === 'shutdown') {
        frames = [
            `\`\`\`ini\n[ SYSTEM SHUTDOWN INITIATED ]\n\`\`\`\n> \`[■□□□□□□□□□] 10%\` Closing background tasks...`,
            `\`\`\`ini\n[ SYSTEM SHUTDOWN INITIATED ]\n\`\`\`\n> \`[■■■■□□□□□□] 40%\` Saving database cache...`,
            `\`\`\`ini\n[ SYSTEM SHUTDOWN INITIATED ]\n\`\`\`\n> \`[■■■■■■■□□□] 70%\` Disconnecting WhatsApp socket...`,
            `\`\`\`ini\n[ SYSTEM SHUTDOWN INITIATED ]\n\`\`\`\n> \`[■■■■■■■■■■] 100%\` All processes stopped.`,
            `> 🔴 *SYSTEM OFFLINE*\n> ────────────────\n> \`[ OK ] Anti-Delete Disabled.\`\n> \`[ OK ] Bot went to sleep (Simulation).\`\n> \n> 👋 _Goodbye!_`
        ];
    } else if (type === 'reboot') {
        frames = [
            `\`\`\`ini\n[ SYSTEM REBOOT INITIATED ]\n\`\`\`\n> \`[■□□□□□□□□□] 20%\` Unmounting plugins...`,
            `\`\`\`ini\n[ SYSTEM REBOOT INITIATED ]\n\`\`\`\n> \`[■■■■■□□□□□] 50%\` Flushing memory (RAM)...`,
            `\`\`\`ini\n[ SYSTEM REBOOT INITIATED ]\n\`\`\`\n> \`[■■■■■■■■□□] 80%\` Rebooting core engine...`,
            `\`\`\`ini\n[ SYSTEM REBOOT INITIATED ]\n\`\`\`\n> \`[■■■■■■■■■■] 100%\` Reconnecting...`,
            `> 🟢 *SYSTEM ONLINE*\n> ────────────────\n> \`[ OK ] Node.js Environment Loaded.\`\n> \`[ OK ] WhatsApp Connection Restored.\`\n> \n> 🚀 _Bot is back online! (Simulation)_`
        ];
    } else {
        frames = [
            `\`\`\`ini\n[ BOOTING ARSLAN MDX ]\n\`\`\`\n> \`[■□□□□□□□□□] 20%\` Initializing OS...`,
            `\`\`\`ini\n[ BOOTING ARSLAN MDX ]\n\`\`\`\n> \`[■■■■■□□□□□] 50%\` Loading 50+ Plugins...`,
            `\`\`\`ini\n[ BOOTING ARSLAN MDX ]\n\`\`\`\n> \`[■■■■■■■■□□] 80%\` Starting Anti-Delete & Anti-Call...`,
            `\`\`\`ini\n[ BOOTING ARSLAN MDX ]\n\`\`\`\n> \`[■■■■■■■■■■] 100%\` Server Ready.`,
            `> ⚡ *SYSTEM BOOTED*\n> ────────────────\n> \`[ OK ] Terminal Access Granted.\`\n> \`[ OK ] Security Protocols Active.\`\n> \n> 💻 _Welcome to ARSLAN MDX._`
        ];
    }

    // Send first frame
    msg = await ctx.reply(frames[0]);
    try { await ctx.react('⏳'); } catch {}

    // Edit subsequent frames
    for (let i = 1; i < frames.length; i++) {
        await delay(1200); // 1.2s delay
        try {
            await ctx.sock.sendMessage(ctx.from, { text: frames[i], edit: msg.key });
        } catch (e) {
            logger.warn(`[POWER] Edit failed, sending new message.`);
            await ctx.reply(frames[i]);
        }
    }
    
    try { await ctx.react('✅'); } catch {}
}

// ═══════════════════════════════════════════════════════════════════
// 1. POWER MENU (Native Flow UI)
// ═══════════════════════════════════════════════════════════════════
export const power = {
    name: 'power',
    aliases: ['syscontrol', 'panel', 'menu'],
    async run(ctx) {
        if (!ctx.isOwner) return ctx.reply('> ❌ *ACCESS DENIED*\n> ╰─➤ Owner only command.');
        try { await ctx.react('🎛️'); } catch {}

        const interactiveMessage = {
            header: {
                title: "ARSLAN MDX CORE",
                subtitle: "System Control Panel"
            },
            body: {
                text: "⚡ *Welcome to the Advanced Terminal.*\n\nSelect a system action below to execute. This will trigger a live animation on your screen."
            },
            footer: {
                text: "© POWERED BY ARSLAN TECH"
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "🟢 Boot / Start System",
                            id: ".start"
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "🔄 Reboot Server",
                            id: ".reboot"
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "🔴 Shutdown System",
                            id: ".shutdown"
                        })
                    }
                ]
            }
        };

        const relayNodes = [
            {
                tag: "biz", attrs: {}, content: [
                    { tag: "interactive", attrs: { type: "native_flow", v: "1" }, content: [
                        { tag: "native_flow", attrs: { v: "9", name: "mixed" } }
                    ]}
                ]
            }
        ];

        await ctx.sock.relayMessage(ctx.from, { interactiveMessage }, {
            messageId: generateMessageID(),
            additionalNodes: relayNodes
        });
    }
};

// ═══════════════════════════════════════════════════════════════════
// 2. EXECUTABLE COMMANDS (Trigger Animation)
// ═══════════════════════════════════════════════════════════════════
export const shutdown = {
    name: 'shutdown',
    aliases: ['poweroff', 'stop'],
    async run(ctx) {
        if (!ctx.isOwner) return ctx.reply('> ❌ *ACCESS DENIED*');
        await runTerminalAnimation(ctx, 'shutdown');
    }
};

export const reboot = {
    name: 'reboot',
    aliases: ['restart'],
    async run(ctx) {
        if (!ctx.isOwner) return ctx.reply('> ❌ *ACCESS DENIED*');
        await runTerminalAnimation(ctx, 'reboot');
    }
};

export const start = {
    name: 'start',
    aliases: ['boot', 'poweron'],
    async run(ctx) {
        await runTerminalAnimation(ctx, 'start');
    }
};
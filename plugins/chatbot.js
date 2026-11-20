/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🤖 CHATBOT.JS — ARSLAN MDX · AI Auto-Reply (Grok + Fallback)    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Engine: Grok (xAI) API + Pollinations Fallback                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHATBOT_DATA = path.join(__dirname, '..', 'data', 'chatbot.json');

const chatMemory = new Map(); 
const MAX_MEMORY_MESSAGES = 10; 

// ─── HELPERS ───
function loadChatbotData() {
    try {
        if (fs.existsSync(CHATBOT_DATA)) return JSON.parse(fs.readFileSync(CHATBOT_DATA, 'utf8'));
    } catch (e) {}
    return { dms: false, groups: false, status: false, chats: {} };
}

function saveChatbotData(data) {
    const dir = path.dirname(CHATBOT_DATA);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CHATBOT_DATA, JSON.stringify(data, null, 2));
}

const UI = (title, text) => `> 🤖 *${title.toUpperCase()}*\n> ────────────────\n${text}\n> ────────────────\n> 💫 _POWERED BY ARSLAN MD_ 💫`;

// ─── COMMAND HANDLER ───
export const chatbot = {
    name: 'chatbot',
    aliases: ['aichat', 'botchat'],
    async run(ctx) {
        if (!ctx.isOwner) return ctx.reply(UI('Access Denied', '> ❌ Only Owner can use this command.'));
        const subCommand = ctx.args.join(' ').toLowerCase().trim();
        const data = loadChatbotData();

        if (subCommand === 'usage' || subCommand === 'help') {
            return ctx.reply(UI('Chatbot Usage', `> ▸ \`.chatbot dms on/off\`\n> ▸ \`.chatbot group on/off\`\n> ▸ \`.chatbot status on/off\`\n> ▸ \`.chatbot on/off\``));
        }
        if (subCommand === 'dms on') { data.dms = true; saveChatbotData(data); return ctx.reply(UI('Chatbot', '> ✅ Auto-reply enabled in *DMs*.')); }
        if (subCommand === 'dms off') { data.dms = false; saveChatbotData(data); return ctx.reply(UI('Chatbot', '> ❌ Auto-reply disabled in *DMs*.')); }
        if (subCommand === 'group on' || subCommand === 'groups on') { data.groups = true; saveChatbotData(data); return ctx.reply(UI('Chatbot', '> ✅ Auto-reply enabled in *Groups*.')); }
        if (subCommand === 'group off' || subCommand === 'groups off') { data.groups = false; saveChatbotData(data); return ctx.reply(UI('Chatbot', '> ❌ Auto-reply disabled in *Groups*.')); }
        if (subCommand === 'on') { data.chats[ctx.from] = true; saveChatbotData(data); return ctx.reply(UI('Chatbot', '> ✅ Enabled for *this chat only*.')); }
        if (subCommand === 'off') { data.chats[ctx.from] = false; saveChatbotData(data); return ctx.reply(UI('Chatbot', '> ❌ Disabled for *this chat only*.')); }

        const isGroup = ctx.isGroup;
        const chatStatus = data.chats[ctx.from];
        const currentStatus = chatStatus === false ? '❌ Off (this chat)' : chatStatus === true ? '✅ On (this chat)' : isGroup && data.groups ? '✅ On (all groups)' : !isGroup && data.dms ? '✅ On (all DMs)' : '❌ Off';

        return ctx.reply(UI('Chatbot Status', `> ▸ *DMs:* ${data.dms ? '✅' : '❌'}\n> ▸ *Groups:* ${data.groups ? '✅' : '❌'}\n> ▸ *Status:* ${data.status ? '✅' : '❌'}\n> ▸ *This Chat:* ${currentStatus}`));
    }
};

// ─── AUTO-RESPONSE HANDLER ───
export async function handleChatbotResponse(sock, msg, chatId, userMessage) {
    try {
        const data = loadChatbotData();
        const isGroup = chatId.endsWith('@g.us');

        if (chatId === 'status@broadcast') { if (!data.status) return; } 
        else {
            const chatSetting = data.chats[chatId];
            if (chatSetting === false) return;
            if (chatSetting !== true) {
                if (isGroup && !data.groups) return;
                if (!isGroup && !data.dms) return;
            }
        }

        if (userMessage.startsWith('.') || msg.key.fromMe) return;

        const senderJid = msg.key.participant || msg.key.remoteJid;
        const userName = msg.pushName || 'User';
        let history = chatMemory.get(senderJid) || [];

        const systemPrompt = 
            `You are "ARSLAN MDX", a smart, friendly WhatsApp AI bot created by "Arslan Tech" from Pakistan.\n` +
            `The user talking to you is named "${userName}".\n` +
            `RULES:\n` +
            `1. ALWAYS reply in Roman Urdu or English. NEVER use Portuguese, Spanish, or other languages unless the user speaks them.\n` +
            `2. If asked "Who are you?", say you are ARSLAN MDX AI by Arslan Tech.\n` +
            `3. Keep replies short, human-like, and use emojis.\n` +
            `4. Act like a helpful friend.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: userMessage }
        ];

        await sock.sendPresenceUpdate('composing', chatId).catch(() => {});

        let replyText = null;
        const grokKey = process.env.GROK_API_KEY;

        // 🚀 1. Try Grok (xAI) Official API
        if (grokKey) {
            try {
                const grokRes = await fetch('https://api.x.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${grokKey}`
                    },
                    body: JSON.stringify({
                        model: 'grok-beta', // Grok model name
                        messages: messages,
                        temperature: 0.7,
                        max_tokens: 150
                    })
                });
                const grokData = await grokRes.json();
                if (grokData.choices?.[0]?.message?.content) {
                    replyText = grokData.choices[0].message.content;
                }
            } catch (e) {
                logger.warn(`[CHATBOT] Grok API Failed, switching to Pollinations...`);
            }
        }

        // 🚀 2. Fallback to Pollinations (Free)
        if (!replyText) {
            try {
                const pollRes = await fetch('https://text.pollinations.ai/openai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'openai', messages: messages })
                });
                const pollData = await pollRes.json();
                replyText = pollData.choices?.[0]?.message?.content;
            } catch (e) {
                logger.error(`[CHATBOT] Pollinations fallback also failed.`);
            }
        }

        await sock.sendPresenceUpdate('paused', chatId).catch(() => {});

        if (replyText && replyText.length > 2) {
            // Memory Update
            history.push({ role: 'user', content: userMessage });
            history.push({ role: 'assistant', content: replyText.trim() });
            if (history.length > MAX_MEMORY_MESSAGES) history = history.slice(history.length - MAX_MEMORY_MESSAGES);
            chatMemory.set(senderJid, history);

            await sock.sendMessage(chatId, { text: replyText.trim() }, { quoted: msg });
        }

    } catch (error) {
        logger.error(`[CHATBOT] Error: ${error.message}`);
    }
}
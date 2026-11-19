/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🤖 CHATBOT.JS — ARSLAN MDX · AI Auto-Reply System (v2 Memory)   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Engine: Pollinations AI                                         ║
 * ║  Features: Chat Memory, Identity, Language Lock (Urdu/English)   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHATBOT_DATA = path.join(__dirname, '..', 'data', 'chatbot.json');

// 🧠 MEMORY SYSTEM (User ki pichli baatein yaad rakhne ke liye)
const chatMemory = new Map(); 
const MAX_MEMORY_MESSAGES = 6; // Sirf aakhri 6 messages yaad rakhega

// ═══════════════════════════════════════════════════════════════════
// 🔤 BOLD SERIF FONT & UI
// ═══════════════════════════════════════════════════════════════════
const BOLD = {
  '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗',
  'A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆','H':'𝐇','I':'𝐈','J':'𝐉',
  'K':'𝐊','L':'𝐋','M':'𝐌','N':'𝐍','O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓',
  'U':'𝐔','V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙',
  'a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠','h':'𝐡','i':'𝐢','j':'𝐣',
  'k':'𝐤','l':'𝐥','m':'𝐦','n':'𝐧','o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭',
  'u':'𝐮','v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳',
};
const bold = (s) => String(s).replace(/[0-9A-Za-z]/g, (c) => BOLD[c] || c);

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

const UI = (title, text) => {
    return `> 🤖 *${bold(title.toUpperCase())}*\n` +
           `> ────────────────\n` +
           `${text}\n` +
           `> ────────────────\n` +
           `> 💫 _POWERED BY ARSLAN MD_ 💫`;
};

// ═══════════════════════════════════════════════════════════════════
// 1. COMMAND HANDLER (.chatbot)
// ═══════════════════════════════════════════════════════════════════
export const chatbot = {
    name: 'chatbot',
    aliases: ['aichat', 'botchat'],
    async run(ctx) {
        if (!ctx.isOwner) return ctx.reply(UI('Access Denied', '> ❌ Only Owner can use this command.'));

        const subCommand = ctx.args.join(' ').toLowerCase().trim();
        const data = loadChatbotData();

        if (subCommand === 'usage' || subCommand === 'help') {
            const helpText = `> ▸ \`.chatbot dms on/off\`\n` +
                             `> ▸ \`.chatbot group on/off\`\n` +
                             `> ▸ \`.chatbot status on/off\`\n` +
                             `> ▸ \`.chatbot on/off\` (This Chat)`;
            return ctx.reply(UI('Chatbot Usage', helpText));
        }

        if (subCommand === 'dms on') { data.dms = true; saveChatbotData(data); return ctx.reply(UI('Chatbot', '> ✅ Auto-reply enabled in *DMs*.')); }
        if (subCommand === 'dms off') { data.dms = false; saveChatbotData(data); return ctx.reply(UI('Chatbot', '> ❌ Auto-reply disabled in *DMs*.')); }
        if (subCommand === 'group on' || subCommand === 'groups on') { data.groups = true; saveChatbotData(data); return ctx.reply(UI('Chatbot', '> ✅ Auto-reply enabled in *Groups*.')); }
        if (subCommand === 'group off' || subCommand === 'groups off') { data.groups = false; saveChatbotData(data); return ctx.reply(UI('Chatbot', '> ❌ Auto-reply disabled in *Groups*.')); }
        if (subCommand === 'on') { data.chats[ctx.from] = true; saveChatbotData(data); return ctx.reply(UI('Chatbot', '> ✅ Enabled for *this chat only*.')); }
        if (subCommand === 'off') { data.chats[ctx.from] = false; saveChatbotData(data); return ctx.reply(UI('Chatbot', '> ❌ Disabled for *this chat only*.')); }

        // Status
        const isGroup = ctx.isGroup;
        const chatStatus = data.chats[ctx.from];
        const currentStatus = chatStatus === false ? '❌ Off (this chat)' :
                              chatStatus === true ? '✅ On (this chat)' :
                              isGroup && data.groups ? '✅ On (all groups)' :
                              !isGroup && data.dms ? '✅ On (all DMs)' : '❌ Off';

        const statusText = `> ▸ *DMs :* ${data.dms ? '✅ On' : '❌ Off'}\n` +
                           `> ▸ *Groups :* ${data.groups ? '✅ On' : '❌ Off'}\n` +
                           `> ▸ *Status :* ${data.status ? '✅ On' : '❌ Off'}\n` +
                           `> ▸ *This Chat :* ${currentStatus}`;
        return ctx.reply(UI('Chatbot Status', statusText));
    }
};

// ═══════════════════════════════════════════════════════════════════
// 2. AUTO-RESPONSE HANDLER (With Memory & Identity)
// ═══════════════════════════════════════════════════════════════════
export async function handleChatbotResponse(sock, msg, chatId, userMessage) {
    try {
        const data = loadChatbotData();
        const isGroup = chatId.endsWith('@g.us');

        // Toggles Check
        if (chatId === 'status@broadcast') {
            if (!data.status) return;
        } else {
            const chatSetting = data.chats[chatId];
            if (chatSetting === false) return;
            if (chatSetting !== true) {
                if (isGroup && !data.groups) return;
                if (!isGroup && !data.dms) return;
            }
        }

        if (userMessage.startsWith('.') || msg.key.fromMe) return;

        // User Details
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const userName = msg.pushName || 'User';
        
        // 🧠 Memory Nikaalo (Agar pehle baat hui hai)
        let history = chatMemory.get(senderJid) || [];

        // AI ki Personality (System Prompt)
        const systemPrompt = 
            `You are "ARSLAN MDX", a smart, friendly, and slightly witty WhatsApp AI bot created by "Arslan Tech".\n` +
            `The person you are talking to is named "${userName}".\n\n` +
            `STRICT RULES:\n` +
            `1. ALWAYS reply in Roman Urdu (Hinglish) OR English, matching the user's language. NEVER reply in Portuguese, Spanish, or random languages.\n` +
            `2. If asked "Who are you?", tell them you are ARSLAN MDX AI, developed by Arslan Tech from Pakistan.\n` +
            `3. If asked "Who is Arslan?", tell them he is a genius developer and the creator of this bot.\n` +
            `4. Keep replies short, human-like, and use emojis. Do not give long paragraphs.\n` +
            `5. Do not sound robotic. Act like a helpful friend.`;

        // Messages Array for API
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: userMessage }
        ];

        await sock.sendPresenceUpdate('composing', chatId).catch(() => {});

        // Fetch AI Response
        const response = await fetch('https://text.pollinations.ai/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'openai',
                messages: messages
            })
        });

        await sock.sendPresenceUpdate('paused', chatId).catch(() => {});

        const result = await response.json();
        const replyText = result.choices?.[0]?.message?.content;

        if (replyText && replyText.length > 2) {
            // 🧠 Memory Update karo
            history.push({ role: 'user', content: userMessage });
            history.push({ role: 'assistant', content: replyText.trim() });
            
            // Memory limit (Sirf aakhri 6 messages)
            if (history.length > MAX_MEMORY_MESSAGES) {
                history = history.slice(history.length - MAX_MEMORY_MESSAGES);
            }
            chatMemory.set(senderJid, history);

            await sock.sendMessage(chatId, { text: replyText.trim() }, { quoted: msg });
        }

    } catch (error) {
        logger.error(`[CHATBOT] Error: ${error.message}`);
    }
}
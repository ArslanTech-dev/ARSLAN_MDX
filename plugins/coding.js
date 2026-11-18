/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  💻 CODING.JS — ARSLAN MDX · AI Coder & Code Executor            ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Commands: ai, code, gpt, run, exec                              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import axios from 'axios';
import logger from '../utils/logger.js';

// ═══════════════════════════════════════════════════════════════════
// 🔤 BOLD SERIF FONT
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

// ⏱️ Cooldown (5s per user)
const cooldown = new Map();
const digits = (jid) => String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');
function onCooldown(ctx) {
  const key = digits(ctx.sender) || ctx.from;
  const now = Date.now();
  if (now - (cooldown.get(key) || 0) < 5000) return true;
  cooldown.set(key, now);
  if (cooldown.size > 500) cooldown.delete(cooldown.keys().next().value);
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// 1. AI CODER — Write / Explain Code
// ═══════════════════════════════════════════════════════════════════
export const ai = {
  name: 'ai',
  aliases: ['code', 'gpt', 'ask'],
  async run(ctx) {
    let prompt = ctx.args.join(' ');
    if (!prompt) return ctx.reply(`> ❌ *${bold('USAGE')}*\n> ╰─➤ .ai write a python script to hack nasa`);

    if (onCooldown(ctx)) return;
    try { await ctx.react('🧠'); } catch {}

    let waitMsg;
    try {
        waitMsg = await ctx.reply(`> 🧠 *${bold('AI THINKING...')}*\n> ╰─➤ \`${prompt}\``);
    } catch {}

    try {
        // Free GPT API (No key required)
        const res = await axios.get(`https://api.nyxs.pw/ai/gpt4?text=${encodeURIComponent(prompt)}`, { timeout: 30000 });
        
        let replyText = res.data?.result || res.data?.data || res.data?.message;
        if (!replyText) throw new Error('AI could not generate a response.');

        // Delete wait message
        if (waitMsg) await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});

        const caption = `> 🤖 *${bold('AI RESPONSE')}*\n` +
                        `> ────────────────\n` +
                        `${replyText}\n` +
                        `> ────────────────\n` +
                        `> 💫 _POWERED BY ARSLAN MD_ 💫`;

        await ctx.reply(caption);
        try { await ctx.react('✅'); } catch {}
    } catch (err) {
        if (waitMsg) await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});
        logger.error(`[AI] Error: ${err.message}`);
        try { await ctx.react('❌'); } catch {}
        await ctx.reply(`> ❌ *${bold('AI FAILED')}*\n> ╰─➤ ${err.message}\n> ╰─➤ Try again later.`);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2. CODE RUNNER — Execute Code Sandboxed
// ═══════════════════════════════════════════════════════════════════
export const run = {
  name: 'run',
  aliases: ['exec', 'compile'],
  async run(ctx) {
    // Syntax: .run <language> <code> OR reply to a message containing code
    let argsText = ctx.args.join(' ');
    
    // Agar user ne kisi code message pe reply kiya hai
    const m = ctx.msg?.message || {};
    const info = m.extendedTextMessage?.contextInfo;
    if (info?.quotedMessage) {
        const quotedText = info.quotedMessage.conversation || info.quotedMessage.extendedTextMessage?.text;
        if (quotedText && !argsText) {
            argsText = quotedText;
        }
    }

    if (!argsText) {
        return ctx.reply(`> ❌ *${bold('USAGE')}*\n> ╰─➤ .run js console.log("Hello")\n> ╰─➤ OR reply to a code message with .run js`);
    }

    // Language aur code alag karo (First word = language)
    const parts = argsText.trim().split(/\s+/);
    let lang = parts[0].toLowerCase();
    let code = parts.slice(1).join(' ');

    if (!code) return ctx.reply(`> ❌ *${bold('ERROR')}*\n> ╰─➤ Please provide code to run.`);

    // Language map (WhatsApp ke short names se Piston ke full names)
    const langMap = {
        'js': 'javascript', 'javascript': 'javascript', 'node': 'javascript',
        'py': 'python', 'python': 'python', 'python3': 'python',
        'cpp': 'c++', 'c++': 'c++', 'c': 'c',
        'java': 'java', 'go': 'go', 'rust': 'rust',
        'php': 'php', 'rb': 'ruby', 'ruby': 'ruby',
        'sh': 'bash', 'bash': 'bash'
    };

    const pistonLang = langMap[lang];
    if (!pistonLang) {
        return ctx.reply(`> ❌ *${bold('UNSUPPORTED')}*\n> ╰─➤ Supported: js, py, cpp, c, java, go, php, rb.`);
    }

    if (onCooldown(ctx)) return;
    try { await ctx.react('⚙️'); } catch {}

    let waitMsg;
    try {
        waitMsg = await ctx.reply(`> ⚙️ *${bold('COMPILING & RUNNING...')}*\n> ╰─➤ Language: \`${pistonLang}\``);
    } catch {}

    try {
        // Piston API (Free Sandboxed Code Runner)
        const apiUrl = 'https://emkc.org/api/v2/piston/execute';
        
        const payload = {
            language: pistonLang,
            version: '*', // Latest version
            files: [{ content: code }]
        };

        const res = await axios.post(apiUrl, payload, { timeout: 15000 });
        
        if (waitMsg) await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});

        const output = res.data?.run?.output;
        const stderr = res.data?.run?.stderr;
        const exitCode = res.data?.run?.code;

        if (stderr) {
            const errMsg = `> ❌ *${bold('RUNTIME ERROR')}*\n` +
                           `> ────────────────\n` +
                           `> ⚠️ \`Exit Code: ${exitCode}\`\n` +
                           `> \`\`\`${stderr}\`\`\`\n` +
                           `> ────────────────\n` +
                           `> 💫 _POWERED BY ARSLAN MD_ 💫`;
            await ctx.reply(errMsg);
            try { await ctx.react('❌'); } catch {}
        } else {
            const finalOutput = output || 'No output (Program executed successfully).';
            const successMsg = `> ✅ *${bold('OUTPUT')}*\n` +
                               `> ────────────────\n` +
                               `> \`\`\`${finalOutput}\`\`\`\n` +
                               `> ────────────────\n` +
                               `> 💫 _POWERED BY ARSLAN MD_ 💫`;
            await ctx.reply(successMsg);
            try { await ctx.react('✅'); } catch {}
        }
    } catch (err) {
        if (waitMsg) await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});
        logger.error(`[RUN] Error: ${err.message}`);
        try { await ctx.react('❌'); } catch {}
        await ctx.reply(`> ❌ *${bold('EXECUTION FAILED')}*\n> ╰─➤ API Error: ${err.message}`);
    }
  }
};
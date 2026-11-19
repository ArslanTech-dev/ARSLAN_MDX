/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  💻 CODEGEN.JS — ARSLAN MDX · AI Code Generator (Terminal UI)    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Command: .code                                                  ║
 * ║  Usage: .code write a python script to scrape google             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import fs from 'fs';
import path from 'path';
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

// ═══════════════════════════════════════════════════════════════════
// 🛠️ FILE EXTENSION MAP
// ═══════════════════════════════════════════════════════════════════
const EXT_MAP = {
    'javascript': 'js', 'js': 'js', 'typescript': 'ts', 'ts': 'ts',
    'python': 'py', 'py': 'py', 'html': 'html', 'css': 'css',
    'dart': 'dart', 'java': 'java', 'cpp': 'cpp', 'c++': 'cpp',
    'c': 'c', 'csharp': 'cs', 'cs': 'cs', 'ruby': 'rb', 'rb': 'rb',
    'php': 'php', 'swift': 'swift', 'kotlin': 'kt', 'kt': 'kt',
    'go': 'go', 'rust': 'rs', 'rs': 'rs', 'sql': 'sql',
    'bash': 'sh', 'sh': 'sh', 'powershell': 'ps1', 'ps1': 'ps1'
};

// ═══════════════════════════════════════════════════════════════════
// 🎬 TERMINAL ANIMATION FRAMES
// ═══════════════════════════════════════════════════════════════════
const loadingFrames = [
    `\`\`\`ini\n[ COMPILING AI CORES ]\n\`\`\`\n> \`[■□□□□□□□□□] 10%\` Analyzing prompt...`,
    `\`\`\`ini\n[ COMPILING AI CORES ]\n\`\`\`\n> \`[■■■□□□□□□□] 30%\` Fetching libraries...`,
    `\`\`\`ini\n[ COMPILING AI CORES ]\n\`\`\`\n> \`[■■■■■□□□□□] 50%\` Writing algorithms...`,
    `\`\`\`ini\n[ COMPILING AI CORES ]\n\`\`\`\n> \`[■■■■■■■□□□] 70%\` Checking syntax errors...`,
    `\`\`\`ini\n[ COMPILING AI CORES ]\n\`\`\`\n> \`[■■■■■■■■■□] 90%\` Formatting file...`,
    `\`\`\`ini\n[ SYSTEM READY ]\n\`\`\`\n> \`[■■■■■■■■■■] 100%\` Code generated successfully!`
];

// ═══════════════════════════════════════════════════════════════════
// 🚀 MAIN COMMAND
// ═══════════════════════════════════════════════════════════════════
export const code = {
    name: 'code',
    aliases: ['aicode', 'generate'],
    async run(ctx) {
        let prompt = ctx.args.join(' ').trim();
        
        // Reply check
        const m = ctx.msg?.message || {};
        const info = m.extendedTextMessage?.contextInfo;
        if (!prompt && info?.quotedMessage) {
            prompt = info.quotedMessage.conversation || info.quotedMessage.extendedTextMessage?.text || '';
        }

        if (!prompt) {
            return ctx.reply(`> 💻 *${bold('AI CODE GENERATOR')}*\n` +
                             `> ────────────────\n` +
                             `> 📝 \`Usage   : .code <prompt>\`\n` +
                             `> 📝 \`Example : .code python script to send email\`\n` +
                             `> ────────────────\n` +
                             `> 💫 _POWERED BY ARSLAN MD_ 💫`);
        }

        try { await ctx.react('💻'); } catch {}

        // Start Animation
        let waitMsg = await ctx.reply(loadingFrames[0]);
        let frame = 0;
        const interval = setInterval(async () => {
            try { 
                if (frame < loadingFrames.length - 1) { 
                    frame++; 
                    await ctx.sock.sendMessage(ctx.from, { text: loadingFrames[frame], edit: waitMsg.key }); 
                } 
            } catch (e) {}
        }, 1300); // 1.3s delay

        try {
            // AI Prompt
            const aiPrompt = `Write a code for: "${prompt}". 
Return ONLY the code and filename in this exact format:
FILENAME: name_of_file
\`\`\`language
code_here
\`\`\`
Do not add any extra explanation.`;

            // Fetch from Pollinations (Free AI)
            const response = await fetch('https://text.pollinations.ai/openai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'openai',
                    messages: [{ role: 'user', content: aiPrompt }]
                })
            });

            const result = await response.json();
            const answer = result.choices?.[0]?.message?.content;

            clearInterval(interval);

            if (!answer || answer.length < 10) throw new Error('AI failed to generate code.');

            // Final frame update
            await ctx.sock.sendMessage(ctx.from, { text: loadingFrames[loadingFrames.length - 1], edit: waitMsg.key }).catch(() => {});

            // Extract Code and Extension
            const codeBlockMatch = answer.match(/```[\s\S]*?```/);
            const cleanCode = codeBlockMatch
                ? codeBlockMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '').trim()
                : answer.trim();

            const langMatch = codeBlockMatch ? codeBlockMatch[0].match(/```(\w+)/) : null;
            const lang = langMatch ? langMatch[1].toLowerCase() : '';
            const extension = EXT_MAP[lang] || 'txt';

            const fileMatch = answer.match(/FILENAME:\s*([\w.-]+)/i);
            const fileNameWord = (fileMatch ? fileMatch[1] : 'code').toLowerCase().replace(/\.[^/.]+$/, ""); 
            const fileName = `${fileNameWord}.${extension}`;

            // Save File
            const outputDir = './output';
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
            const filePath = path.join(outputDir, fileName);
            fs.writeFileSync(filePath, cleanCode);

            // Premium Caption
            const caption = 
                `> 💻 *${bold('CODE GENERATED')}*\n` +
                `> ────────────────\n` +
                `> 📁 \`File   : ${fileName}\`\n` +
                `> 📝 \`Prompt : ${prompt.substring(0, 25)}...\`\n` +
                `> ────────────────\n` +
                `> ⚠️ _Note: AI can make mistakes. Review the code before running._\n` +
                `> 💫 _POWERED BY ARSLAN MD_ 💫`;

            // Send Document
            await ctx.send({
                document: fs.readFileSync(filePath),
                fileName: fileName,
                mimetype: 'text/plain',
                caption: caption
            });

            // Cleanup
            fs.unlinkSync(filePath);
            try { await ctx.react('✅'); } catch {}

        } catch (err) {
            clearInterval(interval);
            logger.error(`[CODE] Error: ${err.message}`);
            try { await ctx.react('❌'); } catch {}
            
            await ctx.sock.sendMessage(ctx.from, { 
                text: `> ❌ *${bold('FAILED')}*\n> ╰─➤ AI could not generate code.\n> ╰─➤ Try a different prompt.`, 
                edit: waitMsg.key 
            }).catch(() => {
                ctx.reply(`> ❌ *${bold('FAILED')}*\n> ╰─➤ AI could not generate code.`);
            });
        }
    }
};
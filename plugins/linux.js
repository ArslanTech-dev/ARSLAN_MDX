/**
 * ═══════════════════════════════════════════════════════════════════
 * 🐧 LINUX.JS — ARSLAN MDX Terminal & Hacker Animations
 * ═══════════════════════════════════════════════════════════════════
 * Commands: matrix, hacker, neon, glitch, terminal, neural, scan, 
 * firewall, datastream, pingmatrix, hackerart
 */

import logger from '../utils/logger.js';

// ─── Helpers ──────────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

const matrixChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', '█', '▓', '▒', '░'];

// 🚀 Animation Helper (Message Edit)
async function animateProgress(ctx, stages) {
    const msg = await ctx.reply(`> ⏳ *${stages[0]}* [░░░░░░░░░░] 0%`);
    for (let i = 1; i < stages.length; i++) {
        await sleep(700);
        const percent = Math.round((i / (stages.length - 1)) * 100);
        const bar = '▓'.repeat(Math.round(percent / 10)) + '░'.repeat(10 - Math.round(percent / 10));
        await ctx.send({ text: `> ⏳ *${stages[i]}*\n> [${bar}] ${percent}%`, edit: msg.key });
    }
}

// ═══════════════════════════════════════════════════════════════════
// 1. MATRIX
// ═══════════════════════════════════════════════════════════════════
export const matrix = {
  name: 'matrix',
  aliases: ['matrixrain'],
  async run(ctx) {
    await ctx.react('💻');
    
    let matrix = '';
    for (let i = 0; i < 8; i++) {
        let line = '';
        for (let j = 0; j < 12; j++) {
            line += random(matrixChars) + ' ';
        }
        matrix += `> ${line}\n`;
    }

    await ctx.reply(`> 💻 *MATRIX RAIN*
> 
${matrix}
> 🟢 _The Matrix Has You..._
> 
> © POWERED BY ARSLAN MD`);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2. HACKER (Animated)
// ═══════════════════════════════════════════════════════════════════
export const hacker = {
  name: 'hacker',
  aliases: ['hackmode'],
  async run(ctx) {
    await ctx.react('🔥');
    
    await animateProgress(ctx, [
        'INITIALIZING HACKER MODE...',
        'SCANNING TARGET...',
        'BYPASSING FIREWALL...',
        'ACCESSING DATABASE...'
    ]);

    const target = random(['NSA', 'CIA', 'FBI', 'MI6', 'RAW', 'ISI', 'KGB']);
    const data = random(['Top Secret', 'Confidential', 'Classified', 'Eyes Only']);

    await ctx.reply(`> 🔥 *HACKER MODE*
> 
> ✅ *ACCESS GRANTED!*
> 🎯 *Target:* ${target}
> 📁 *Data:* ${data}
> 🔒 *Status:* COMPROMISED
> 
> ⚠️ _This is a simulation!_
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('💀');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 3. NEON
// ═══════════════════════════════════════════════════════════════════
export const neon = {
  name: 'neon',
  async run(ctx) {
    const text = ctx.args.join(' ') || 'ARSLAN TECH\'S';
    await ctx.react('💡');

    const neonColors = ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠', '💖', '⚪'];
    const color = random(neonColors);
    const style = random(['Cyberpunk', 'Synthwave', 'Vaporwave', 'Retro Neon']);

    await ctx.reply(`> 💡 *NEON TEXT*
> 
> ${color} *${text}* ${color}
> 
> ✨ *Glowing Effect Active* ✨
> 🎨 *Style:* ${style}
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✨');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 4. GLITCH
// ═══════════════════════════════════════════════════════════════════
export const glitch = {
  name: 'glitch',
  aliases: ['glitchtext'],
  async run(ctx) {
    const text = ctx.args.join(' ') || 'ARSLAN MD';
    await ctx.react('📺');

    let glitchText = '';
    for (let i = 0; i < text.length; i++) {
        glitchText += Math.random() > 0.7 ? String.fromCharCode(33 + Math.floor(Math.random() * 94)) : text[i];
    }

    await ctx.reply(`> 📺 *GLITCH EFFECT*
> 
> ⚡ _[GLITCH]_
> > 🔲 *${glitchText}*
> > 🔲 *${text}*
> 
> 🎛️ *Glitch Level:* ${Math.floor(Math.random() * 100)}%
> 💥 *${random(['System Error', 'Corruption Detected', 'Signal Interference'])}*
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('⚡');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 5. TERMINAL
// ═══════════════════════════════════════════════════════════════════
export const terminal = {
  name: 'terminal',
  aliases: ['term'],
  async run(ctx) {
    await ctx.react('⌨️');

    const commands = [
        'ls -la', 'sudo apt update', 'sudo apt upgrade -y', 'neofetch',
        'htop', 'python3 script.py', 'node index.js', 'docker run arslan-md',
        'git clone https://github.com/ArslanTech-dev/ARSLAN-MD', 'npm install',
        'pm2 start index.js', 'whoami', 'uname -a', 'df -h', 'exit'
    ];

    let term = '';
    for (let i = 0; i < 6; i++) {
        term += `> root@arslan:~$ ${random(commands)}\n`;
        if (Math.random() > 0.5) {
            term += `> ✓ Output: ${random(['Success', 'Done', 'Complete', 'Running', 'Active'])}\n`;
        }
    }

    await ctx.reply(`> ⌨️ *TERMINAL SIMULATOR*
> 
${term}
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 6. NEURAL
// ═══════════════════════════════════════════════════════════════════
export const neural = {
  name: 'neural',
  aliases: ['neuralnet'],
  async run(ctx) {
    await ctx.react('🧠');

    let neural = '';
    for (let i = 0; i < 5; i++) {
        let line = '';
        for (let j = 0; j < 12; j++) {
            line += (Math.random() > 0.5 ? '🧠' : '⚡') + ' ';
        }
        neural += `> ${line}\n`;
    }

    await ctx.reply(`> 🧠 *NEURAL NETWORK*
> 
${neural}
> ⚡ *Neural Activity:* ${Math.floor(Math.random() * 100)}%
> 🧠 *${random(['Learning', 'Training', 'Processing', 'Analyzing'])}...*
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('⚡');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 7. SCAN
// ═══════════════════════════════════════════════════════════════════
export const scan = {
  name: 'scan',
  aliases: ['portscan'],
  async run(ctx) {
    await ctx.react('🔍');
    const target = ctx.args.join(' ') || 'localhost';

    let scanStr = '';
    for (let i = 0; i < 8; i++) {
        const port = Math.floor(Math.random() * 65535) + 1;
        const status = Math.random() > 0.7 ? '🔓 OPEN' : '🔒 CLOSED';
        scanStr += `> ▸ Port ${port}: ${status}\n`;
    }

    await ctx.reply(`> 🔍 *PORT SCAN*
> 
> 🎯 *Target:* ${target}
> ⏳ *Scanning...*
> 
${scanStr}
> 🚀 _Scan Complete_
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 8. FIREWALL
// ═══════════════════════════════════════════════════════════════════
export const firewall = {
  name: 'firewall',
  aliases: ['fw'],
  async run(ctx) {
    await ctx.react('🛡️');

    const logs = [
        '🛡️ Firewall Active',
        '⚠️ Intrusion Detected!',
        '✅ Blocked: 192.168.1.100',
        '⚠️ Brute Force Attack Blocked',
        '✅ All Systems Nominal',
        '⚠️ Suspicious Activity Logged',
        '✅ Firewall Updated'
    ];

    let fw = '';
    for (let i = 0; i < 5; i++) {
        fw += `> ${random(logs)}\n`;
    }

    await ctx.reply(`> 🛡️ *FIREWALL LOG*
> 
${fw}
> 🛡️ *Security Status:* ${random(['Active', 'Protecting', 'Monitoring'])}
> 📊 *Protection Level:* ${Math.floor(Math.random() * 100)}%
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 9. DATASTREAM
// ═══════════════════════════════════════════════════════════════════
export const datastream = {
  name: 'datastream',
  aliases: ['stream'],
  async run(ctx) {
    await ctx.react('📊');

    let data = '';
    for (let i = 0; i < 6; i++) {
        let line = '';
        for (let j = 0; j < 10; j++) {
            line += Math.floor(Math.random() * 10) + ' ';
        }
        data += `> ${line} | ${random(['OK', 'PASS', 'SYNC', 'TX', 'RX'])}\n`;
    }

    await ctx.reply(`> 📊 *DATA STREAM*
> 
${data}
> 📈 *Data Flow:* ${Math.floor(Math.random() * 1000)} Mbps
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 10. PINGMATRIX
// ═══════════════════════════════════════════════════════════════════
export const pingmatrix = {
  name: 'pingmatrix',
  aliases: ['pmatrix'],
  async run(ctx) {
    await ctx.react('📡');
    const target = ctx.args.join(' ') || 'server.arslan.com';

    let pings = '';
    for (let i = 0; i < 6; i++) {
        const ms = Math.floor(Math.random() * 100) + 10;
        const status = ms < 50 ? '✅' : ms < 80 ? '⚠️' : '❌';
        pings += `> ${status} Reply from ${target} | ${ms}ms\n`;
    }

    await ctx.reply(`> 📡 *PING MATRIX*
> 
> 🎯 *Target:* ${target}
> 
${pings}
> 📊 *Packet Loss:* ${Math.floor(Math.random() * 5)}%
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 11. HACKERART
// ═══════════════════════════════════════════════════════════════════
export const hackerart = {
  name: 'hackerart',
  aliases: ['art'],
  async run(ctx) {
    await ctx.react('🎨');

    const art = `
████╗ ██████╗ ███████╗██╗      █████╗ ███╗   ██╗
██╔═██╗██╔══██╗██╔════╝██║     ██╔══██╗████╗  ██║
███████║██████╔╝███████╗██║     ███████║██╔██╗ ██║
██╔══██║██╔══██╗╚════██║██║     ██╔══██║██║╚██╗██║
██║  ██║██║  ██║███████║███████╗██║  ██║██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝
               ARSLAN TECH'S`.trim();

    await ctx.reply(`> 🎨 *HACKER ASCII ART*
> 
> ${art.replace(/\n/g, '\n> ')}
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};
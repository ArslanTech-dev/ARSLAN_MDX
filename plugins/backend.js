/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  💻 BACKEND.JS — ARSLAN MDX · Advanced System Dashboard          ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Commands: sys, backend, cpu, ram                                ║
 * ║  Style: Cyberpunk Terminal / Hacker UI                           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import os from 'os';
import fs from 'fs';
import axios from 'axios';
import { CONFIG } from '../config.js';
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
// 🛠️ HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════
const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatUptime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
};

// Progress Bar Generator (Hacker Style)
const generateBar = (percentage, length = 10) => {
    const filled = Math.round((percentage / 100) * length);
    const empty = length - filled;
    const color = percentage > 80 ? '🟥' : percentage > 50 ? '🟨' : '🟩';
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage.toFixed(1)}% ${color}`;
};

// ═══════════════════════════════════════════════════════════════════
// 1. SYSTEM DASHBOARD (.sys / .backend)
// ═══════════════════════════════════════════════════════════════════
export const sys = {
    name: 'sys',
    aliases: ['backend', 'system', 'server'],
    async run(ctx) {
        try { await ctx.react('💻'); } catch {}

        // CPU Calculation
        const cpus = os.cpus();
        const cpuModel = cpus[0].model;
        const cpuSpeed = cpus[0].speed;
        // Simple CPU usage approximation based on load average
        const loadAvg = os.loadavg()[0];
        const cpuUsage = Math.min((loadAvg / cpus.length) * 100, 100);

        // RAM Calculation
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memPercent = (usedMem / totalMem) * 100;

        // Bot Process RAM
        const botMem = process.memoryUsage().rss;

        // Disk Space (Root)
        let diskText = 'N/A';
        try {
            const stat = fs.statfsSync(process.cwd());
            const diskTotal = stat.blocks * stat.bsize;
            const diskFree = stat.bfree * stat.bsize;
            const diskUsed = diskTotal - diskFree;
            const diskPercent = (diskUsed / diskTotal) * 100;
            diskText = generateBar(diskPercent) + `\n> └─ ${formatBytes(diskUsed)} / ${formatBytes(diskTotal)}`;
        } catch (e) {
            diskText = '> └─ Unable to read disk info.';
        }

        // Network Latency (Ping to Cloudflare)
        let ping = 'N/A';
        const start = Date.now();
        try {
            await axios.head('https://1.1.1.1', { timeout: 3000 });
            ping = `${Date.now() - start} ms`;
        } catch {
            ping = '> 999 ms (Timeout)';
        }

        const text = 
`\`\`\`
[ SYSTEM CORE // ONLINE ]
\`\`\`
> 🖥️ *${bold('OS INFO')}*
> ├─ \`Platform : ${os.platform()} (${os.arch()})\`
> ├─ \`Hostname : ${os.hostname()}\`
> └─ \`Node.js  : ${process.version}\`

> ⚙️ *${bold('PROCESSOR')}*
> ├─ \`Model : ${cpuModel.substring(0, 25)}...\`
> ├─ \`Cores : ${cpus.length}\`
> └─ \`Speed : ${cpuSpeed} MHz\`
> _Load: ${generateBar(cpuUsage)}_

> 🧠 *${bold('MEMORY (RAM)')}*
> ├─ \`System : ${formatBytes(usedMem)} / ${formatBytes(totalMem)}\`
> ├─ \`Bot RSS: ${formatBytes(botMem)}\`
> └─ _Usage: ${generateBar(memPercent)}_

> 💾 *${bold('STORAGE')}*
> ${diskText}

> 📡 *${bold('NETWORK')}*
> ├─ \`Ping (1.1.1.1) : ${ping}\`
> └─ \`Uptime         : ${formatUptime(os.uptime())}\`
> 
> 💫 _POWERED BY ARSLAN MD_`;

        await ctx.reply(text);
        try { await ctx.react('✅'); } catch {}
    }
};

// ═══════════════════════════════════════════════════════════════════
// 2. CPU STATUS (.cpu)
// ═══════════════════════════════════════════════════════════════════
export const cpu = {
    name: 'cpu',
    aliases: ['processor'],
    async run(ctx) {
        try { await ctx.react('⚙️'); } catch {}
        const cpus = os.cpus();
        const loadAvg = os.loadavg();
        const cpuUsage = Math.min((loadAvg[0] / cpus.length) * 100, 100);

        const text = 
`\`\`\`
[ CPU DIAGNOSTICS ]
\`\`\`
> ⚙️ *${bold('CPU INFO')}*
> ├─ \`Model  : ${cpus[0].model}\`
> ├─ \`Cores  : ${cpus.length}\`
> └─ \`Speed  : ${cpus[0].speed} MHz\`

> 📊 *${bold('LOAD AVERAGE')}*
> ├─ \`1 Min  : ${loadAvg[0].toFixed(2)}\`
> ├─ \`5 Min  : ${loadAvg[1].toFixed(2)}\`
> └─ \`15 Min : ${loadAvg[2].toFixed(2)}\`

> 💻 *${bold('USAGE')}*
> ${generateBar(cpuUsage)}

> 💫 _POWERED BY ARSLAN MD_`;

        await ctx.reply(text);
        try { await ctx.react('✅'); } catch {}
    }
};

// ═══════════════════════════════════════════════════════════════════
// 3. RAM STATUS (.ram)
// ═══════════════════════════════════════════════════════════════════
export const ram = {
    name: 'ram',
    aliases: ['memory'],
    async run(ctx) {
        try { await ctx.react('🧠'); } catch {}
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memPercent = (usedMem / totalMem) * 100;
        
        // Detailed Process Memory
        const mem = process.memoryUsage();

        const text = 
`\`\`\`
[ MEMORY DIAGNOSTICS ]
\`\`\`
> 🧠 *${bold('SYSTEM RAM')}*
> ├─ \`Total : ${formatBytes(totalMem)}\`
> ├─ \`Used  : ${formatBytes(usedMem)}\`
> ├─ \`Free  : ${formatBytes(freeMem)}\`
> └─ \`Usage : ${generateBar(memPercent)}\`

> 🤖 *${bold('BOT PROCESS')}*
> ├─ \`RSS   : ${formatBytes(mem.rss)}\` (Total Allocated)
> ├─ \`Heap  : ${formatBytes(mem.heapUsed)} / ${formatBytes(mem.heapTotal)}\`
> └─ \`External : ${formatBytes(mem.external)}\`

> 💫 _POWERED BY ARSLAN MD_`;

        await ctx.reply(text);
        try { await ctx.react('✅'); } catch {}
    }
};
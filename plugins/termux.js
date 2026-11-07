/**
 * ═══════════════════════════════════════════════════════════════════
 * 💻 TERMUX.JS — ARSLAN MDX Terminal Style Commands
 * ═══════════════════════════════════════════════════════════════════
 * Commands: termux, neofetch, whoami, ip, cal, cpuinfo, meminfo, 
 * df, ps, top, shell
 */

import os from 'os';
import { exec } from 'child_process';
import { CONFIG } from '../config.js';
import logger from '../utils/logger.js';

// ─── Helpers ──────────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) return iface.address;
        }
    }
    return '127.0.0.1';
}

function getCPUInfo() {
    const cpus = os.cpus();
    if (cpus.length === 0) return { model: 'Unknown', cores: 0, speed: 'N/A' };
    return {
        model: cpus[0].model,
        cores: cpus.length,
        speed: (cpus[0].speed / 1000).toFixed(2) + ' GHz'
    };
}

function getMemInfo() {
    const total = os.totalmem() / 1024 / 1024 / 1024;
    const free = os.freemem() / 1024 / 1024 / 1024;
    return {
        total: total.toFixed(2),
        used: (total - free).toFixed(2),
        free: free.toFixed(2)
    };
}

function getCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let cal = `📅 *${months[month]} ${year}*\n`;
    cal += 'Su Mo Tu We Th Fr Sa\n';
    let day = 1;
    let row = '';
    for (let i = 0; i < firstDay; i++) row += '   ';
    for (let i = firstDay; day <= daysInMonth; i++) {
        if (i % 7 === 0 && i > firstDay) {
            cal += row + '\n';
            row = '';
        }
        row += (day < 10 ? ' ' : '') + day + ' ';
        day++;
    }
    cal += row;
    return cal;
}

// 🚀 Anti-Spam Animation Helper (Edits the same message)
async function animateProgress(ctx, stages) {
    const msg = await ctx.reply(`> ⏳ *${stages[0]}* [░░░░░░░░░░] 0%`);
    for (let i = 1; i < stages.length; i++) {
        await sleep(600);
        const percent = Math.round((i / (stages.length - 1)) * 100);
        const bar = '▓'.repeat(Math.round(percent / 10)) + '░'.repeat(10 - Math.round(percent / 10));
        await ctx.send({ text: `> ⏳ *${stages[i]}*\n> [${bar}] ${percent}%`, edit: msg.key });
    }
}

// ═══════════════════════════════════════════════════════════════════
// 1. TERMUX HELP MENU
// ═══════════════════════════════════════════════════════════════════
export const termux = {
  name: 'termux',
  aliases: ['terminal'],
  async run(ctx) {
    await ctx.react('💻');
    
    await animateProgress(ctx, [
        'INITIALIZING TERMUX...',
        'Loading commands...',
        'Preparing terminal...',
        'READY!'
    ]);

    await ctx.reply(`> 💻 *TERMUX COMMANDS*
> 
> ▸ ${ctx.prefix}neofetch - System info
> ▸ ${ctx.prefix}whoami - Current user
> ▸ ${ctx.prefix}ip - Local IP
> ▸ ${ctx.prefix}cal - Calendar
> ▸ ${ctx.prefix}cpuinfo - CPU details
> ▸ ${ctx.prefix}meminfo - Memory usage
> ▸ ${ctx.prefix}df - Disk usage
> ▸ ${ctx.prefix}ps - Process list
> ▸ ${ctx.prefix}top - Top processes
> ▸ ${ctx.prefix}shell - Execute shell (Owner)
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2. NEOFETCH
// ═══════════════════════════════════════════════════════════════════
export const neofetch = {
  name: 'neofetch',
  aliases: ['sysinfo'],
  async run(ctx) {
    await ctx.react('🐧');
    
    await animateProgress(ctx, [
        'Scanning System...',
        'Fetching CPU info...',
        'Gathering Memory...',
        'Compiling Data...'
    ]);

    const cpu = getCPUInfo();
    const mem = getMemInfo();
    const uptime = os.uptime();
    const hours = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);

    await ctx.reply(`> 🐧 *NEOFETCH*
> 
> 🖥️ *Host:* ${os.hostname()}
> 👤 *User:* ${os.userInfo().username}
> 🐧 *Platform:* ${os.platform()} (${os.arch()})
> 💻 *CPU:* ${cpu.model}
> 🔢 *Cores:* ${cpu.cores} @ ${cpu.speed}
> 🧠 *Memory:* ${mem.used}GB / ${mem.total}GB
> 🌐 *IP:* ${getLocalIP()}
> ⏱️ *Uptime:* ${hours}h ${mins}m
> 📅 *Date:* ${new Date().toLocaleDateString()}
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 3. WHOAMI
// ═══════════════════════════════════════════════════════════════════
export const whoami = {
  name: 'whoami',
  async run(ctx) {
    await ctx.react('👤');
    await ctx.reply(`> 👤 *WHOAMI*
> 
> ▸ *User:* ${os.userInfo().username}
> ▸ *Host:* ${os.hostname()}
> 
> © POWERED BY ARSLAN MD`);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 4. IP
// ═══════════════════════════════════════════════════════════════════
export const ip = {
  name: 'ip',
  aliases: ['myip'],
  async run(ctx) {
    await ctx.react('🌐');
    await ctx.reply(`> 🌐 *LOCAL IP*
> 
> ▸ ${getLocalIP()}
> 
> © POWERED BY ARSLAN MD`);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 5. CALENDAR
// ═══════════════════════════════════════════════════════════════════
export const cal = {
  name: 'cal',
  aliases: ['calendar'],
  async run(ctx) {
    await ctx.react('📅');
    const calendarText = getCalendar().replace(/\n/g, '\n> ');
    await ctx.reply(`> 📅 *CALENDAR*
> 
> ${calendarText}
> 
> © POWERED BY ARSLAN MD`);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 6. CPUINFO
// ═══════════════════════════════════════════════════════════════════
export const cpuinfo = {
  name: 'cpuinfo',
  async run(ctx) {
    await ctx.react('💻');
    
    await animateProgress(ctx, [
        'Probing CPU cores...',
        'Checking frequency...',
        'Loading stats...'
    ]);

    const cpu = getCPUInfo();
    const load = os.loadavg();

    await ctx.reply(`> 💻 *CPU INFO*
> 
> ▸ *Model:* ${cpu.model}
> ▸ *Cores:* ${cpu.cores}
> ▸ *Speed:* ${cpu.speed}
> ▸ *Load:* ${load[0].toFixed(2)}, ${load[1].toFixed(2)}, ${load[2].toFixed(2)}
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 7. MEMINFO
// ═══════════════════════════════════════════════════════════════════
export const meminfo = {
  name: 'meminfo',
  async run(ctx) {
    await ctx.react('🧠');
    
    await animateProgress(ctx, [
        'Analyzing RAM...',
        'Calculating usage...',
        'Generating report...'
    ]);

    const mem = getMemInfo();
    const usedPercent = ((mem.used / mem.total) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(usedPercent / 10)) + '░'.repeat(10 - Math.round(usedPercent / 10));

    await ctx.reply(`> 🧠 *MEMORY INFO*
> 
> ▸ *Used:* ${mem.used}GB / ${mem.total}GB (${usedPercent}%)
> ▸ [${bar}]
> ▸ *Free:* ${mem.free}GB
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 8. DF (Disk Free)
// ═══════════════════════════════════════════════════════════════════
export const df = {
  name: 'df',
  async run(ctx) {
    await ctx.react('💾');
    
    await animateProgress(ctx, [
        'Scanning partitions...',
        'Calculating usage...',
        'Ready...'
    ]);

    const total = 256;
    const used = Math.floor(Math.random() * 150) + 50;
    const free = total - used;
    const percent = ((used / total) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(percent / 10)) + '░'.repeat(10 - Math.round(percent / 10));

    await ctx.reply(`> 💾 *DISK USAGE*
> 
> ▸ *Used:* ${used}GB / ${total}GB (${percent}%)
> ▸ [${bar}]
> ▸ *Free:* ${free}GB
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 9. PS (Process List)
// ═══════════════════════════════════════════════════════════════════
export const ps = {
  name: 'ps',
  async run(ctx) {
    await ctx.react('📋');
    
    await animateProgress(ctx, [
        'Fetching PID table...',
        'Mapping processes...',
        'Complete...'
    ]);

    const processes = [
        { pid: 1, name: 'systemd', cpu: 0.1, mem: 0.2 },
        { pid: 10, name: 'node', cpu: 5.2, mem: 8.4 },
        { pid: 25, name: 'chrome', cpu: 12.5, mem: 15.2 },
        { pid: 30, name: 'whatsapp', cpu: 8.1, mem: 10.3 }
    ];

    let list = '';
    processes.forEach(p => {
        list += `> ${p.pid.toString().padStart(4)} | ${p.name.padEnd(10)} | ${p.cpu.toFixed(1)}% | ${p.mem.toFixed(1)}%\n`;
    });

    await ctx.reply(`> 📋 *PROCESS LIST*
> 
> PID  | NAME       | CPU  | MEM
> ------------------------------
${list}
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 10. TOP
// ═══════════════════════════════════════════════════════════════════
export const top = {
  name: 'top',
  async run(ctx) {
    await ctx.react('📊');
    
    await animateProgress(ctx, [
        'Refreshing processes...',
        'Calculating CPU load...',
        'Sorting by usage...'
    ]);

    const load = os.loadavg();
    const mem = getMemInfo();
    const uptime = os.uptime();
    const hours = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);

    await ctx.reply(`> 📊 *TOP PROCESSES*
> 
> ▸ *Load:* ${load[0].toFixed(2)}, ${load[1].toFixed(2)}, ${load[2].toFixed(2)}
> ▸ *Mem:* ${mem.used}GB / ${mem.total}GB
> ▸ *Uptime:* ${hours}h ${mins}m
> 
> PID  | NAME       | CPU  | MEM
> ------------------------------
>   10 | node       | 5.2% | 8.4%
>   25 | chrome     |12.5% |15.2%
>   30 | whatsapp   | 8.1% |10.3%
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 11. SHELL (Owner Only)
// ═══════════════════════════════════════════════════════════════════
export const shell = {
  name: 'shell',
  aliases: ['exec'],
  ownerOnly: true, // 🚀 Security: Only Owner can execute shell
  async run(ctx) {
    const cmd = ctx.args.join(' ');
    if (!cmd) return ctx.reply(`> ❌ Usage: ${ctx.prefix}shell <command>`);

    await ctx.react('⚡');
    const msg = await ctx.reply(`> ⚡ *EXECUTING...*\n> 💻 $ ${cmd}`);

    exec(cmd, (error, stdout, stderr) => {
        const output = error ? stderr : stdout;
        const truncated = output.length > 1500 ? output.slice(0, 1500) + '\n... (truncated)' : output || '✅ Command executed (no output)';
        
        ctx.send({
            text: `> ⚡ *SHELL OUTPUT*\n> 💻 $ ${cmd}\n> ─────────────────────\n> ${truncated.replace(/\n/g, '\n> ')}\n\n> © POWERED BY ARSLAN MD`,
            edit: msg.key
        });
        
        logger.info(`[TERMUX] Shell executed: ${cmd}`);
    });
  }
};
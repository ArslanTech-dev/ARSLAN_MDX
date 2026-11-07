/**
 * ═══════════════════════════════════════════════════════════════════
 * 🪟 WINDOWS.JS — ARSLAN MDX Windows Simulations
 * ═══════════════════════════════════════════════════════════════════
 * Commands: winstartup, bsod, cmd, winsettings, winexplorer, 
 * winupdate, winerror, winregistry, winlogo, wintaskmanager
 */

import logger from '../utils/logger.js';

// ─── Helpers ──────────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

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
// 1. WINSTARTUP
// ═══════════════════════════════════════════════════════════════════
export const winstartup = {
  name: 'winstartup',
  aliases: ['winboot'],
  async run(ctx) {
    await ctx.react('🪟');
    
    await animateProgress(ctx, [
        'BIOS Initializing...',
        'POST (Power-On Self-Test)...',
        'Loading Windows...',
        'Starting Services...',
        'System Ready!'
    ]);

    await ctx.reply(`> ✅ *WINDOWS STARTED SUCCESSFULLY!*
> 
> 🪟 *Version:* Windows 11 Pro
> 💻 *Build:* 22621
> ⏱️ *Startup Time:* ${Math.floor(Math.random() * 10) + 3}s
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2. BSOD (Blue Screen of Death)
// ═══════════════════════════════════════════════════════════════════
export const bsod = {
  name: 'bsod',
  aliases: ['bluescreen'],
  async run(ctx) {
    await ctx.react('💀');
    
    const errors = [
        'CRITICAL_PROCESS_DIED', 'SYSTEM_SERVICE_EXCEPTION',
        'MEMORY_MANAGEMENT', 'KERNEL_DATA_INPAGE_ERROR',
        'IRQL_NOT_LESS_OR_EQUAL', 'PAGE_FAULT_IN_NONPAGED_AREA',
        'BAD_SYSTEM_CONFIG_INFO', 'VIDEO_TDR_FAILURE'
    ];
    
    const error = random(errors);
    const code = '0x' + Math.floor(Math.random() * 10000000).toString(16).toUpperCase();

    await ctx.reply(`> 💀 *BLUE SCREEN OF DEATH*
> 
> ⚠️ Windows has encountered an error.
> 
> ❌ *Error:* \`${error}\`
> 🔢 *Code:* \`${code}\`
> 📁 *Dump:* memory.dmp
> 
> 🔄 _Restarting in 10 seconds..._
> 
> 💡 _It's just a simulation!_
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('💀');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 3. CMD (Command Prompt)
// ═══════════════════════════════════════════════════════════════════
export const cmd = {
  name: 'cmd',
  aliases: ['commandprompt'],
  async run(ctx) {
    await ctx.react('⌨️');
    
    const cmdCommands = [
        'dir', 'cd Desktop', 'mkdir ARSLAN_MD', 'cd ARSLAN_MD',
        'node index.js', 'npm install', 'npm start', 'exit'
    ];

    let cmdStr = '';
    for (let i = 0; i < 5; i++) {
        cmdStr += `> C:\\Users\\Arslan> ${random(cmdCommands)}\n`;
        if (Math.random() > 0.5) {
            cmdStr += `> ✓ ${random(['Success', 'Done', 'Complete', 'Running'])}\n`;
        }
    }

    await ctx.reply(`> ⌨️ *COMMAND PROMPT*
> 
> 💻 Microsoft Windows [Version 10.0.22621]
> (c) Microsoft Corporation.
> 
${cmdStr}
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 4. WINSETTINGS
// ═══════════════════════════════════════════════════════════════════
export const winsettings = {
  name: 'winsettings',
  aliases: ['winsys'],
  async run(ctx) {
    await ctx.react('⚙️');
    
    await ctx.reply(`> ⚙️ *WINDOWS SETTINGS*
> 
> ▸ *System:* Windows 11 Pro
> ▸ *Processor:* Intel Core i9-13900K
> ▸ *RAM:* 64GB DDR5
> ▸ *Storage:* 2TB NVMe SSD
> ▸ *Graphics:* NVIDIA RTX 4090
> ▸ *Display:* 4K 144Hz
> ▸ *Network:* Wi-Fi 6E
> ▸ *Status:* Active
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 5. WINEXPLORER
// ═══════════════════════════════════════════════════════════════════
export const winexplorer = {
  name: 'winexplorer',
  aliases: ['winfiles'],
  async run(ctx) {
    await ctx.react('📁');
    
    const files = [
        '📁 ARSLAN_MD', '📁 Projects', '📁 Documents', 
        '📁 Downloads', '📄 index.js', '📄 config.js', 
        '📄 package.json', '📄 README.md'
    ];

    let explorer = '';
    for (const file of files) {
        explorer += `> ${file}\n`;
    }

    await ctx.reply(`> 📁 *FILE EXPLORER*
> 
> 🪟 This PC > Desktop > ARSLAN_MD
> 
${explorer}
> 📊 *Items:* ${files.length} | 💾 *Size:* ${Math.floor(Math.random() * 100) + 50}MB
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 6. WINUPDATE
// ═══════════════════════════════════════════════════════════════════
export const winupdate = {
  name: 'winupdate',
  aliases: ['winup'],
  async run(ctx) {
    await ctx.react('🔄');
    
    await animateProgress(ctx, [
        'Checking for updates...',
        'Downloading update KB5027303...',
        'Installing updates...'
    ]);

    await ctx.reply(`> ✅ *UPDATE COMPLETE!*
> 
> 🔄 Restarting system...
> ⏳ _Please wait..._
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 7. WINERROR
// ═══════════════════════════════════════════════════════════════════
export const winerror = {
  name: 'winerror',
  aliases: ['winerr'],
  async run(ctx) {
    await ctx.react('❌');
    
    const errors = [
        'Error 0x80070005: Access Denied',
        'Error 0x80070422: Service Not Running',
        'Error 0x80070643: Update Failed',
        'Error 0x80070002: File Not Found',
        'Error 0x80070570: Corrupt File'
    ];

    const error = random(errors);

    await ctx.reply(`> ❌ *WINDOWS ERROR*
> 
> ⚠️ An error occurred!
> 
> 🚫 ${error}
> 📁 *Details:* ${random(['File corrupted', 'Permission denied', 'Network timeout', 'Disk full'])}
> 
> 🔄 _Try restarting the application._
> 
> 💡 _Just a simulation!_
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('❌');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 8. WINREGISTRY
// ═══════════════════════════════════════════════════════════════════
export const winregistry = {
  name: 'winregistry',
  aliases: ['regedit'],
  async run(ctx) {
    await ctx.react('🔧');
    
    const registry = [
        'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion',
        'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
        'HKLM\\SYSTEM\\CurrentControlSet\\Control',
        'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion'
    ];

    let reg = '';
    for (const r of registry) {
        reg += `> ▸ ${r}\n`;
    }

    await ctx.reply(`> 🔧 *REGISTRY EDITOR*
> 
> 🪟 Windows Registry Editor
> 
${reg}
> ⚠️ _Edit at your own risk!_
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 9. WINLOGO
// ═══════════════════════════════════════════════════════════════════
export const winlogo = {
  name: 'winlogo',
  aliases: ['windowslogo'],
  async run(ctx) {
    await ctx.react('🪟');
    
    const logo = `
 ██╗    ██╗██╗███╗   ██╗
 ██║ █╗ ██║██║████╗  ██║
 ██║███╗██║██║██╔██╗ ██║
 ╚███╔███╔╝██║██║╚██╗██║
  ╚══╝╚══╝ ╚═╝╚═╝ ╚═╝╚═╝`.trim();

    await ctx.reply(`> 🪟 *WINDOWS LOGO*
> 
> ${logo.replace(/\n/g, '\n> ')}
> 
> 💻 Microsoft Windows
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('🪟');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 10. WINTASKMANAGER
// ═══════════════════════════════════════════════════════════════════
export const wintaskmanager = {
  name: 'wintaskmanager',
  aliases: ['taskmgr'],
  async run(ctx) {
    await ctx.react('📊');
    
    const processes = [
        { name: 'System', cpu: 10, mem: 20 },
        { name: 'Windows Explorer', cpu: 5, mem: 15 },
        { name: 'Microsoft Edge', cpu: 25, mem: 40 },
        { name: 'WhatsApp', cpu: 8, mem: 12 },
        { name: 'ARSLAN MD', cpu: 30, mem: 50 },
        { name: 'Node.js', cpu: 45, mem: 60 }
    ];

    let task = '';
    for (const p of processes) {
        task += `> ${p.name.padEnd(15)} | CPU: ${p.cpu.toString().padStart(2)}% | MEM: ${p.mem.toString().padStart(2)}%\n`;
    }

    await ctx.reply(`> 📊 *TASK MANAGER*
> 
${task}
> 💻 *Processes:* ${processes.length} running
> 💾 *CPU:* ${Math.floor(Math.random() * 50 + 20)}% | 🧠 *RAM:* ${Math.floor(Math.random() * 50 + 30)}%
> 
> © POWERED BY ARSLAN MD`);

    await ctx.react('✅');
  }
};
/**
 * ═══════════════════════════════════════════════════════════════════
 * 🐞 ERRORS.JS — ARSLAN MDX Fake Error Simulator
 * ═══════════════════════════════════════════════════════════════════
 * Commands: error, crash, debug, bugreport, fatal, exception, memorydump, buglist
 */

import logger from '../utils/logger.js';

// ─── Helper: Sleep ──────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Helper: Random ─────────────────────────────
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Data Arrays ────────────────────────────────
const errorMessages = [
    "SyntaxError: Unexpected token '}' in line 42",
    "TypeError: Cannot read property 'name' of undefined",
    "ReferenceError: 'x' is not defined",
    "RangeError: Array index out of bounds",
    "TypeError: null is not an object",
    "ENOENT: no such file or directory",
    "ECONNREFUSED: Connection refused",
    "ETIMEDOUT: Request timed out",
    "404 – Not Found",
    "500 – Internal Server Error",
    "503 – Service Unavailable",
    "403 – Forbidden",
    "401 – Unauthorized",
    "Segmentation fault (core dumped)",
    "Bus error: 10",
    "Stack overflow",
    "Out of memory: Heap limit exceeded",
    "Uncaught exception: Cannot divide by zero",
    "Unexpected end of input"
];

const stackTraces = [
    "at Object.<anonymous> (/app/index.js:42:15)\nat Module._compile (node:internal/modules/cjs/loader:1105:14)",
    "at processTicksAndRejections (node:internal/process/task_queues:96:5)\nat async startBot (/app/index.js:156:3)",
    "at Array.forEach (<anonymous>)\nat EventEmitter.emit (node:events:517:28)"
];

const crashMessages = [
    "System crashed: Kernel panic – not syncing",
    "Blue Screen of Death (BSOD): CRITICAL_PROCESS_DIED",
    "Fatal error: Unable to recover from previous errors",
    "Crash dump: memory.dmp (size: 256 MB)",
    "Application terminated unexpectedly",
    "Node.js process exited with code 1",
    "Unhandled promise rejection",
    "Detected memory leak – garbage collector overwhelmed",
    "Out of memory: killed process (OOM Killer)"
];

const debugMessages = [
    "Debugging: Setting breakpoint at line 42",
    "Stepping over function call...",
    "Watch expression: 'x' is undefined",
    "Heap snapshot captured – analyzing...",
    "CPU profiling started...",
    "Memory usage: 256 MB / 512 MB (50%)",
    "Performance issue detected: slow query",
    "Log: Error occurred – retrying... (attempt 3)"
];

// ═══════════════════════════════════════════════════════════════════
// 1. ERROR COMMAND
// ═══════════════════════════════════════════════════════════════════
export const error = {
  name: 'error',
  aliases: ['err'],
  async run(ctx) {
    await ctx.react('❌');
    const errMsg = random(errorMessages);
    const stack = random(stackTraces);

    const text = `> ❌ *RANDOM ERROR*
> 
> 🚫 ${errMsg}
> 
> 📚 *Stack Trace:*
> ${stack.replace(/\n/g, '\n> ')}
> 
> © POWERED BY ARSLAN MD`;

    await ctx.reply(text);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2. CRASH COMMAND (With Animation)
// ═══════════════════════════════════════════════════════════════════
export const crash = {
  name: 'crash',
  aliases: ['bsod'],
  async run(ctx) {
    await ctx.react('💥');
    
    // Sending a dummy message we can edit
    const msg = await ctx.reply(`> 💥 *CRASH SIMULATION*
> ⚠️ Critical error detected...
> [▓░░░░░░░░░] 10%`);

    await sleep(600);
    await ctx.send({ text: `> 💥 *CRASH SIMULATION*
> ⚠️ Dumping memory...
> [▓▓▓▓▓░░░░░] 50%`, edit: msg.key });

    await sleep(600);
    const crashMsg = random(crashMessages);
    
    await ctx.send({ text: `> 💥 *CRASH SIMULATION*
> 💥 ${crashMsg}
> 🔄 System restarting...
> [▓▓▓▓▓▓▓▓▓▓] 100%
> 
> ⚠️ Just a simulation!
> 
> © POWERED BY ARSLAN MD`, edit: msg.key });

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 3. DEBUG COMMAND
// ═══════════════════════════════════════════════════════════════════
export const debug = {
  name: 'debug',
  async run(ctx) {
    await ctx.react('🐞');
    const debugMsg = random(debugMessages);
    const errMsg = random(errorMessages);

    const text = `> 🐞 *DEBUG SESSION*
> 
> 🔍 ${debugMsg}
> 🐛 *Found bug:* ${errMsg}
> 🔧 *Suggested fix:* Check line ${Math.floor(Math.random() * 100) + 1}
> ⏳ Analyzing...
> 
> © POWERED BY ARSLAN MD`;

    await ctx.reply(text);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 4. BUGREPORT COMMAND
// ═══════════════════════════════════════════════════════════════════
export const bugreport = {
  name: 'bugreport',
  async run(ctx) {
    await ctx.react('📝');
    const errMsg = random(errorMessages);
    const stack = random(stackTraces);
    const file = ['index.js', 'app.js', 'server.js', 'bot.js'][Math.floor(Math.random() * 4)];

    const text = `> 📝 *BUG REPORT*
> 
> 🐛 *Issue:* ${errMsg}
> 📍 *Location:* ${file}
> 📅 *Date:* ${new Date().toLocaleString()}
> 🖥️ *Env:* Node.js v${process.version}
> 
> 📚 *Stack Trace:*
> ${stack.replace(/\n/g, '\n> ')}
> 
> 🔧 *Priority:* ${['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]}
> 🚀 *Status:* ${['Open', 'In Progress', 'Closed'][Math.floor(Math.random() * 3)]}
> 
> © POWERED BY ARSLAN MD`;

    await ctx.reply(text);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 5. FATAL COMMAND
// ═══════════════════════════════════════════════════════════════════
export const fatal = {
  name: 'fatal',
  async run(ctx) {
    await ctx.react('💀');
    const errMsg = random(errorMessages);

    const text = `> 💀 *FATAL ERROR*
> 
> ⚠️ Fatal exception caught!
> 🚫 ${errMsg}
> 💀 Process will now exit.
> 🔄 Return code: ${Math.floor(Math.random() * 255)}
> 
> 💡 This is a simulation.
> 
> © POWERED BY ARSLAN MD`;

    await ctx.reply(text);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 6. EXCEPTION COMMAND
// ═══════════════════════════════════════════════════════════════════
export const exception = {
  name: 'exception',
  async run(ctx) {
    const target = ctx.args.join(' ') || 'something';
    await ctx.react('⚠️');
    
    const text = `> ⚠️ *UNCAUGHT EXCEPTION*
> 
> 🐛 In *${target}*:
> ❌ ${random(errorMessages)}
> 📚 ${random(stackTraces).split('\n')[0]}
> 🔄 Thrown at line ${Math.floor(Math.random() * 100) + 1}
> 
> © POWERED BY ARSLAN MD`;

    await ctx.reply(text);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 7. MEMORYDUMP COMMAND
// ═══════════════════════════════════════════════════════════════════
export const memorydump = {
  name: 'memorydump',
  async run(ctx) {
    await ctx.react('🧠');

    const text = `> 🧠 *MEMORY DUMP*
> 
> 📊 *Used:* ${Math.floor(Math.random() * 512) + 128} MB / 1024 MB
> 📈 *Heap:* ${Math.floor(Math.random() * 256) + 64} MB
> 🔄 *GC Activity:* ${Math.random() > 0.5 ? 'Normal' : 'High'}
> 🧩 *Leak Potential:* ${Math.random() > 0.7 ? '⚠️ Detected' : '✅ None'}
> 
> © POWERED BY ARSLAN MD`;

    await ctx.reply(text);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 8. BUGLIST COMMAND
// ═══════════════════════════════════════════════════════════════════
export const buglist = {
  name: 'buglist',
  async run(ctx) {
    await ctx.react('📋');

    const text = `> 📋 *KNOWN BUGS*
> 
> 🐛 1. TypeError in 'fs' – fix: add null check
> 🐛 2. Memory leak in event loop
> 🐛 3. Syntax error in config file
> 🐛 4. Security vulnerability – fix: update dep
> 🐛 5. Performance issue – fix: optimize query
> 
> 🔧 *Assignee:* ${['Arslan', 'Saba', 'Asad'][Math.floor(Math.random() * 3)]}
> 🚀 *Priority:* ${['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]}
> 
> © POWERED BY ARSLAN MD`;

    await ctx.reply(text);
    await ctx.react('✅');
  }
};
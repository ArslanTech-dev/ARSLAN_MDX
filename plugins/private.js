/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔒 PRIVATE.JS — ARSLAN MDX · Private Mode Plugin (v2)           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Commands: private · public · privateon · privateoff · botmode    ║
 * ║                                                                  ║
 * ║  🔒 PRIVATE ON  → sirf linked number ke cmds ka reply            ║
 * ║  🌐 PRIVATE OFF → public mode (sab log cmd de sakte hain)        ║
 * ║                                                                  ║
 * ║  Mode per-session save hota hai: <DB_DIR>/private_mode.json      ║
 * ║  Default: OFF (public)                                           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config.js';
import logger from '../utils/logger.js';

// ─────────────────────────────────────────────────────────────────
//  ⚙️  CONSTANTS
// ─────────────────────────────────────────────────────────────────
const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const SELF_FILE   = path.basename(fileURLToPath(import.meta.url));
const STATE_FILE  = path.join(CONFIG.DB_DIR, 'private_mode.json');
const GUARDED     = Symbol.for('arslan.private.guarded');

/** Linked number ke ilawa owner ko bhi allow karein? */
const ALLOW_OWNER_TOO = false;

// ─────────────────────────────────────────────────────────────────
//  💾  STATE  (per linked number)
// ─────────────────────────────────────────────────────────────────
let state = {};
try {
  if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) || {};
  }
} catch (err) {
  logger.error(`[PRIVATE] State load failed: ${err.message}`);
  state = {};
}

function saveState() {
  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`[PRIVATE] State save failed: ${err.message}`);
  }
}

const keyOf     = (ctx) => String(ctx.botNumber || ctx.sessionNumber || 'default');
const isPrivate = (ctx) => state[keyOf(ctx)] === true;

function setPrivate(ctx, value) {
  state[keyOf(ctx)] = value;
  saveState();
}

// ─────────────────────────────────────────────────────────────────
//  🧠  HELPERS
// ─────────────────────────────────────────────────────────────────
const digits = (jid) =>
  String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

const ownNumber = (ctx) => digits(ctx.botNumber) || 'linked number';

/** Message usi number se aaya jis se bot linked hai? */
function isLinked(ctx) {
  if (ctx.msg?.key?.fromMe === true) return true;
  const bot = digits(ctx.botNumber);
  if (bot && digits(ctx.sender) === bot) return true;
  if (ALLOW_OWNER_TOO && ctx.isOwner) return true;
  return false;
}

/** Safe wrapper — reply/ react fail ho toh crash na ho */
const safe = async (fn) => { try { return await fn(); } catch { /* noop */ } };

// ─────────────────────────────────────────────────────────────────
//  🛡️  GUARD  — baaki plugins ke cmds par
// ─────────────────────────────────────────────────────────────────
function guard(cmd) {
  if (!cmd || typeof cmd.run !== 'function' || cmd[GUARDED]) return;
  const original = cmd.run;

  cmd.run = async function (ctx, ...rest) {
    // private mode ON aur sender linked nahi → silently ignore
    if (ctx && isPrivate(ctx) && !isLinked(ctx)) return;
    return original.call(this, ctx, ...rest);
  };
  cmd[GUARDED] = true;
}

async function guardAllPlugins() {
  let files = [];
  try {
    files = fs.readdirSync(__dirname).filter((f) => f.endsWith('.js') && f !== SELF_FILE);
  } catch (err) {
    logger.error(`[PRIVATE] Plugin scan failed: ${err.message}`);
    return;
  }

  let count = 0;
  for (const file of files) {
    try {
      const mod = await import(`file://${path.join(__dirname, file)}`);
      for (const cmd of [mod.default, ...Object.values(mod)]) {
        if (cmd && cmd.run && cmd.name && !cmd[GUARDED]) {
          guard(cmd);
          count++;
        }
      }
    } catch (err) {
      logger.error(`[PRIVATE] Could not guard ${file}: ${err.message}`);
    }
  }

  logger.info?.(`[PRIVATE] 🛡️  Guard active on ${count} commands`);
}

await guardAllPlugins();

// ─────────────────────────────────────────────────────────────────
//  💬  MESSAGE TEMPLATES
// ─────────────────────────────────────────────────────────────────
const MSG = {
  noAccess: '❌ *Access Denied.*\n> Ye cmd sirf bot ke *linked number* se chalti hai.',

  privateOn: (ctx) =>
    `🔒 *PRIVATE MODE — ON*\n\n` +
    `> Ab bot sirf linked number *(+${ownNumber(ctx)})* ka reply karega.\n` +
    `> Baaki sab ke cmds silently ignore honge.\n\n` +
    `*Off karne ke liye:*\n> ${ctx.prefix}private off`,

  privateOff: (ctx) =>
    `🌐 *PRIVATE MODE — OFF*\n\n` +
    `> Ab dusre log bhi bot ko command de sakte hain.\n\n` +
    `*On karne ke liye:*\n> ${ctx.prefix}private on`,

  status: (ctx, on) =>
    `📌 *BOT MODE*\n` +
    `─────────────────────\n` +
    `> *Mode:*    ${on ? '🔒 PRIVATE' : '🌐 PUBLIC'}\n` +
    `> *Linked:*  +${ownNumber(ctx)}\n` +
    `─────────────────────\n` +
    (on
      ? '> Sirf linked number ke cmds ka reply milta hai.'
      : '> Sab log bot ko cmd de sakte hain.'),

  usage: (ctx, on) =>
    `📌 *PRIVATE MODE*\n\n` +
    `> *Current:* ${on ? '🔒 PRIVATE' : '🌐 PUBLIC'}\n\n` +
    `*Usage:*\n` +
    `> ${ctx.prefix}private on\n` +
    `> ${ctx.prefix}private off\n` +
    `> ${ctx.prefix}private status`,

  badArg: (ctx) =>
    `❌ *Invalid option.*\n\n` +
    `*Use:*\n` +
    `> ${ctx.prefix}private on\n` +
    `> ${ctx.prefix}private off`,
};

// ─────────────────────────────────────────────────────────────────
//  🎯  CORE ACTIONS
// ─────────────────────────────────────────────────────────────────
async function applyMode(ctx, wantPrivate) {
  if (!isLinked(ctx)) {
    // private ON → silently ignore · public → chhota sa notice
    if (isPrivate(ctx)) return;
    return safe(() => ctx.reply(MSG.noAccess));
  }

  setPrivate(ctx, wantPrivate);
  await safe(() => ctx.react(wantPrivate ? '🔒' : '🌐'));
  return safe(() =>
    ctx.reply(wantPrivate ? MSG.privateOn(ctx) : MSG.privateOff(ctx))
  );
}

async function showStatus(ctx) {
  // private ON + non-linked → ignore
  if (!isLinked(ctx) && isPrivate(ctx)) return;
  return safe(() => ctx.reply(MSG.status(ctx, isPrivate(ctx))));
}

// ─────────────────────────────────────────────────────────────────
//  📦  COMMANDS
// ─────────────────────────────────────────────────────────────────

/** `private on|off|status` — main toggle */
export const privateMode = {
  name: 'private',
  aliases: ['privatemode', 'selfmode'],
  async run(ctx) {
    const arg = (ctx.args[0] || '').toLowerCase();
    const on  = isPrivate(ctx);

    // on / enable / 1
    if (['on', 'enable', '1'].includes(arg))  return applyMode(ctx, true);

    // off / disable / 0
    if (['off', 'disable', '0'].includes(arg)) return applyMode(ctx, false);

    // status (ya koi arg nahi)
    if (arg === 'status') return showStatus(ctx);
    if (arg === '') {
      if (isLinked(ctx)) return safe(() => ctx.reply(MSG.usage(ctx, on)));
      return showStatus(ctx);
    }

    // invalid arg
    if (!isLinked(ctx) && on) return;
    return safe(() => ctx.reply(MSG.badArg(ctx)));
  }
};

/** `public` — shortcut: mode off */
export const publicMode = {
  name: 'public',
  aliases: ['publicmode'],
  async run(ctx) { return applyMode(ctx, false); }
};

/** `privateon` — shortcut: mode on */
export const privateOn = {
  name: 'privateon',
  aliases: [],
  async run(ctx) { return applyMode(ctx, true); }
};

/** `privateoff` — shortcut: mode off */
export const privateOff = {
  name: 'privateoff',
  aliases: [],
  async run(ctx) { return applyMode(ctx, false); }
};

/** `botmode` — status only */
export const botMode = {
  name: 'botmode',
  aliases: ['mode'],
  async run(ctx) { return showStatus(ctx); }
};
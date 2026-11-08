/**
 * ═══════════════════════════════════════════════════════════════════
 * 🔒 PRIVATE.js — ARSLAN MDX Private Mode Plugin
 * Commands (5): private, public, privateon, privateoff, botmode
 *
 * 🔒 PRIVATE ON  → bot sirf us number ke messages ka reply karega jis se bot link hai
 *                  (baaki sab ke cmds silently ignore).
 * 🌐 PRIVATE OFF → dusre log bhi bot ko cmd de sakte hain (normal public mode).
 *
 * ⚙️ Ye plugin kisi aur file ko change nahi karta: load hote hi baaki plugins
 *    ke cmds par ek guard laga deta hai. Mode har linked number (session) ka
 *    alag save hota hai: <DB_DIR>/private_mode.json
 *    Default: OFF (public).
 * ═══════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SELF_FILE = path.basename(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(CONFIG.DB_DIR, 'private_mode.json');
const GUARDED = Symbol.for('arslan.private.guarded');

// true = linked number ke ilawa owner (CONFIG.OWNER_NUMBER) ko bhi private mode mein allow karo
const ALLOW_OWNER_TOO = false;

// ───────────────────────── State (per linked number) ─────────────────────────
let state = {};
try {
  if (fs.existsSync(STATE_FILE)) state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) || {};
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

const keyOf = (ctx) => String(ctx.botNumber || ctx.sessionNumber || 'default');
const isPrivate = (ctx) => state[keyOf(ctx)] === true;

function setPrivate(ctx, value) {
  state[keyOf(ctx)] = value;
  saveState();
}

const digits = (jid) => String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

// ✅ Kya ye message usi number se aaya jis se bot link hai?
function isLinked(ctx) {
  if (ctx.msg?.key?.fromMe === true) return true;
  const bot = digits(ctx.botNumber);
  if (bot && digits(ctx.sender) === bot) return true;
  if (ALLOW_OWNER_TOO && ctx.isOwner) return true;
  return false;
}

// ───────────────────────── Guard: baaki plugins ke cmds par ─────────────────────────
function guard(cmd) {
  if (!cmd || typeof cmd.run !== 'function' || cmd[GUARDED]) return;
  const original = cmd.run;
  cmd.run = async function (ctx, ...rest) {
    if (ctx && isPrivate(ctx) && !isLinked(ctx)) return; // private mode: silently ignore
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
      // Bot loader jis tarah import karta hai bilkul wahi path (taake same module instance mile)
      const mod = await import(`file://${path.join(__dirname, file)}`);
      for (const cmd of [mod.default, ...Object.values(mod)]) {
        if (cmd && cmd.run && cmd.name && !cmd[GUARDED]) { guard(cmd); count++; }
      }
    } catch (err) {
      logger.error(`[PRIVATE] Could not guard ${file}: ${err.message}`);
    }
  }
  logger.info?.(`[PRIVATE] Guard active on ${count} commands`);
}

await guardAllPlugins();

// ───────────────────────── Commands ─────────────────────────
const ownNumber = (ctx) => digits(ctx.botNumber) || 'linked number';

async function applyMode(ctx, wantPrivate) {
  if (!isLinked(ctx)) {
    // private ON ho to silently ignore, public ho to chhota sa message
    if (isPrivate(ctx)) return;
    return ctx.reply('❌ Ye cmd sirf bot ke linked number se chalti hai.');
  }
  setPrivate(ctx, wantPrivate);
  await ctx.react(wantPrivate ? '🔒' : '🌐');
  return ctx.reply(
    wantPrivate
      ? `🔒 *PRIVATE MODE ON*\n\nAb bot sirf linked number (+${ownNumber(ctx)}) ke messages ka reply karega.\nBaaki sab ke cmds ignore honge.\n\nOff karne ke liye: *${ctx.prefix}private off*`
      : `🌐 *PRIVATE MODE OFF*\n\nAb dusre log bhi bot ko cmd de sakte hain.\n\nOn karne ke liye: *${ctx.prefix}private on*`
  );
}

async function showStatus(ctx) {
  if (!isLinked(ctx) && isPrivate(ctx)) return;
  const on = isPrivate(ctx);
  return ctx.reply(
    `📌 *BOT MODE*\n\n` +
    `Mode: ${on ? '🔒 *PRIVATE*' : '🌐 *PUBLIC*'}\n` +
    `Linked number: +${ownNumber(ctx)}\n\n` +
    (on
      ? 'Sirf linked number ke cmds ka reply milta hai.'
      : 'Sab log bot ko cmd de sakte hain.')
  );
}

export const privateMode = {
  name: 'private',
  aliases: ['privatemode', 'selfmode'],
  async run(ctx) {
    const arg = (ctx.args[0] || '').toLowerCase();
    if (['on', 'enable', '1'].includes(arg)) return applyMode(ctx, true);
    if (['off', 'disable', '0'].includes(arg)) return applyMode(ctx, false);
    if (arg === 'status' || arg === '') {
      if (arg === '' && isLinked(ctx)) {
        return ctx.reply(`📌 Use: *${ctx.prefix}private on* / *${ctx.prefix}private off* / *${ctx.prefix}private status*\n\nMode abhi: ${isPrivate(ctx) ? '🔒 PRIVATE' : '🌐 PUBLIC'}`);
      }
      return showStatus(ctx);
    }
    if (!isLinked(ctx) && isPrivate(ctx)) return;
    return ctx.reply(`❌ Galat option. Use: *${ctx.prefix}private on* ya *${ctx.prefix}private off*`);
  }
};

export const publicMode = {
  name: 'public',
  aliases: ['publicmode'],
  async run(ctx) { return applyMode(ctx, false); }
};

export const privateOn = {
  name: 'privateon',
  aliases: [],
  async run(ctx) { return applyMode(ctx, true); }
};

export const privateOff = {
  name: 'privateoff',
  aliases: [],
  async run(ctx) { return applyMode(ctx, false); }
};

export const botMode = {
  name: 'botmode',
  aliases: ['mode'],
  async run(ctx) { return showStatus(ctx); }
};

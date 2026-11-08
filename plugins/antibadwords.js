/**
 * ═══════════════════════════════════════════════════════════════════
 * 📦 ANTIBADWORDS.js — ARSLAN MDX Plugin
 * Group mein gaali / bad words (English, Urdu, Punjabi) ko auto-delete karta hai (ON/OFF ke saath).
 * Commands (6): antibadword, badwordaction, addbadword, delbadword, badwords, resetbadwords
 *
 * Usage:
 *   .antibadword on | off | status
 *   .badwordaction delete | warn [limit] | kick
 *   .addbadword <word1> <word2> ...
 *   .delbadword <word>
 *   .badwords
 *   .resetbadwords
 *
 * handlers/message.js har group message par handleAntiBadwords() chalata hai.
 * ═══════════════════════════════════════════════════════════════════
 */

import { cleanJid } from '../utils/helper.js';
import { getGroupSettings, saveGroupSettings } from '../utils/database.js';
import logger from '../utils/logger.js';

// ─── Default bad words (English + Urdu + Punjabi) ─────────────────
// Roman (Latin) spelling mein likhe hain. Leet (5h1t) aur lambe letters (fuuuck) auto pakde jate hain.
// Naye words chahiye to .addbadword <word> use karo (Urdu/Punjabi script bhi chalega).
const ENGLISH = [
  'fuck', 'fucker', 'fucking', 'fucked', 'fucks', 'fuckin', 'fuckoff', 'motherfucker', 'fck', 'fuk', 'fuq',
  'shit', 'shits', 'shitty', 'bullshit', 'bitch', 'bitches', 'bastard', 'asshole', 'ass', 'dumbass', 'jackass',
  'dick', 'dickhead', 'pussy', 'slut', 'whore', 'cunt', 'twat', 'wanker', 'prick', 'cock', 'cocksucker',
  'douchebag', 'bollocks', 'piss', 'wtf', 'stfu', 'nigga', 'nigger', 'faggot', 'retard', 'retarded'
];

const URDU = [
  'madarchod', 'maderchod', 'madarchd', 'mderchod', 'maadarchod', 'behenchod', 'behnchod', 'bhenchod',
  'bhosdike', 'bhosdi', 'bhosda', 'bhosra', 'bhosrike', 'chutiya', 'chutia', 'chutiye', 'chutiyapa', 'chootiya',
  'chut', 'choot', 'gandu', 'gaandu', 'gaand', 'gand', 'harami', 'haramzada', 'haramzadi', 'haramkhor',
  'kamina', 'kamine', 'kameena', 'kamini', 'kutta', 'kutte', 'kuttay', 'kutti', 'kuttiya', 'suar', 'suwar',
  'lund', 'lawde', 'lauda', 'lodu', 'randi', 'randwa', 'bakchod', 'bakchodi', 'chodu', 'tatti', 'saala', 'saali',
  'jhant', 'jhaant', 'jhatu', 'jhatoo', 'bhadwa', 'bhadwe', 'bhadwi', 'dalla', 'tharki', 'gashti',
  'bsdk', 'bkl', 'mkc'
];

const PUNJABI = [
  'penchod', 'pencho', 'pencod', 'kanjar', 'kanjri', 'kanjari', 'chinal', 'chinaal', 'chhinal',
  'kuttia', 'kuttiye', 'haramdi', 'haramda', 'lulli', 'phuddi', 'fuddi', 'phudi', 'fudi',
  'bhosri', 'bhosrey', 'bhonsdi', 'bhonsda', 'raandi', 'gandmara'
];

// Native script (Urdu / Gurmukhi)
const NATIVE = [
  // Urdu
  'مادرچود', 'بہنچود', 'بھوسڑی', 'حرامی', 'حرامزادہ', 'حرامزادی', 'چوتیا', 'چوت', 'گانڈو', 'گانڈ',
  'لنڈ', 'رنڈی', 'کنجر', 'کنجری', 'بھڑوا', 'کمینہ', 'کمینی', 'ٹھرکی',
  // Punjabi (Gurmukhi)
  'ਮਾਦਰਚੋਦ', 'ਭੈਣਚੋਦ', 'ਹਰਾਮੀ', 'ਹਰਾਮਜ਼ਾਦਾ', 'ਕੰਜਰ', 'ਕੰਜਰੀ', 'ਰੰਡੀ', 'ਗਾਂਡੂ', 'ਗਾਂਡ',
  'ਲੰਡ', 'ਚੂਤ', 'ਚੂਤੀਆ', 'ਕੁੱਤੀ', 'ਕਮੀਨਾ', 'ਭੋਸੜੀ', 'ਫੁੱਦੀ', 'ਲੁੱਲੀ'
];

// Same normalize har jagah (word list + user text) taake script/diacritics ka farq na pade
const norm = (w) => String(w || '')
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f\u064B-\u065F\u0670\u200c\u200d]/g, '');

const DEFAULT_BADWORDS = [...new Set([...ENGLISH, ...URDU, ...PUNJABI, ...NATIVE].map(norm))];

const DEFAULT_LIMIT = 3;
const ACTIONS = ['delete', 'warn', 'kick'];

// ─── Helpers ──────────────────────────────────────────────────────
const box = (title, content) => {
  const lines = content.split('\n').map((l) => `│ ${l}`).join('\n');
  return `╭─〔 *${title.toUpperCase()}* 〕─╮\n${lines}\n╰───────────────────╯\n\n> © POWERED BY ARSLAN MD`;
};

async function isAdmin(ctx) {
  if (ctx.isOwner) return true;
  if (!ctx.isGroup) return false;
  try {
    const meta = await ctx.sock.groupMetadata(ctx.from);
    return meta.participants.some((p) => cleanJid(p.id) === cleanJid(ctx.sender) && p.admin);
  } catch { return false; }
}

// Leet-speak ko normal letters mein badalta hai (5h1t -> shit)
const LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's' };
const collapse = (w) => w.replace(/(.)\1+/g, '$1'); // fuuuck -> fuck

function tokenize(text) {
  const base = norm(text);
  const leet = base.replace(/[013457@$]/g, (c) => LEET[c]);
  // Latin + Urdu + Gurmukhi sab letters (\p{L}) aur unke marks (\p{M}) ek word maane jate hain
  const split = (t) => t.split(/[^\p{L}\p{M}]+/u).filter(Boolean);
  // plain + leet dono check hote hain (taake "fuck!" aur "5h1t" dono pakde jayein)
  return [...new Set([...split(base), ...split(leet)])];
}

async function getBwSettings(groupId) {
  const s = await getGroupSettings(groupId);
  return {
    enabled: !!s.antibadwords,
    action: ACTIONS.includes(s.antibadwords_action) ? s.antibadwords_action : 'delete',
    limit: Number(s.antibadwords_limit) || DEFAULT_LIMIT,
    custom: Array.isArray(s.antibadwords_list) ? s.antibadwords_list : [],
    warns: s.antibadwords_warns && typeof s.antibadwords_warns === 'object' ? s.antibadwords_warns : {}
  };
}

function findBadWord(text, custom) {
  const words = new Set([...DEFAULT_BADWORDS, ...custom.map(norm)]);
  // "fuuuck" jaisi spelling ke liye collapsed match, lekin sirf 4+ letters wale words par
  // (taake chhote words jaise "ass" se "as" jaisa normal word na pakda jaye)
  const collapsed = new Set([...words].map(collapse).filter((w) => w.length >= 4));
  for (const tok of tokenize(text)) {
    if (words.has(tok)) return tok;
    const c = collapse(tok);
    if (c.length >= 4 && collapsed.has(c)) return tok;
  }
  return null;
}

// ─── Message hook (handlers/message.js se call hota hai) ──────────
export async function handleAntiBadwords(sock, msg, from, sender, text) {
  try {
    if (!text) return false;
    const cfg = await getBwSettings(from);
    if (!cfg.enabled) return false;
    if (!findBadWord(text, cfg.custom)) return false;

    const meta = await sock.groupMetadata(from);
    const isSenderAdmin = meta.participants.some((p) => cleanJid(p.id) === cleanJid(sender) && p.admin);
    if (isSenderAdmin) return false;

    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = meta.participants.some((p) => cleanJid(p.id) === cleanJid(botJid) && p.admin);
    if (!isBotAdmin) return false;

    const num = cleanJid(sender);
    await sock.sendMessage(from, { delete: msg.key });

    if (cfg.action === 'kick') {
      await sock.sendMessage(from, {
        text: box('Anti Badwords', `🚫 @${num} ne gaali di, group se remove kar diya.`),
        mentions: [sender]
      });
      await sock.groupParticipantsUpdate(from, [sender], 'remove');
      return true;
    }

    if (cfg.action === 'warn') {
      const count = (Number(cfg.warns[num]) || 0) + 1;
      if (count >= cfg.limit) {
        delete cfg.warns[num];
        await saveGroupSettings(from, { antibadwords_warns: cfg.warns });
        await sock.sendMessage(from, {
          text: box('Anti Badwords', `🚫 @${num} ne ${cfg.limit} warnings poori kar di, remove kar diya.`),
          mentions: [sender]
        });
        await sock.groupParticipantsUpdate(from, [sender], 'remove');
      } else {
        cfg.warns[num] = count;
        await saveGroupSettings(from, { antibadwords_warns: cfg.warns });
        await sock.sendMessage(from, {
          text: box('Anti Badwords', `⚠️ @${num} gaali mat do!\nWarning: ${count}/${cfg.limit}`),
          mentions: [sender]
        });
      }
      return true;
    }

    // action = delete
    await sock.sendMessage(from, {
      text: box('Anti Badwords', `⚠️ @${num} gaali dena mana hai, message delete kar diya.`),
      mentions: [sender]
    });
    return true;
  } catch (err) {
    logger.error(`[ANTIBADWORDS] ${err.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 1. ANTIBADWORD (on / off / status)
// ═══════════════════════════════════════════════════════════════════
export const antibadword = {
  name: 'antibadword',
  aliases: ['antibadwords', 'abw', 'antibad'],
  groupOnly: true,
  async run(ctx) {
    if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);

    const sub = (ctx.args[0] || '').toLowerCase();
    const cfg = await getBwSettings(ctx.from);

    if (sub === 'on' || sub === 'off') {
      await saveGroupSettings(ctx.from, { antibadwords: sub === 'on' });
      await ctx.react(sub === 'on' ? '✅' : '❌');
      return ctx.reply(box('Anti Badwords',
        sub === 'on'
          ? `✅ *ON* ho gaya.\nAction: ${cfg.action}\n\n⚠️ Bot ka group admin hona zaroori hai.`
          : `❌ *OFF* ho gaya.`));
    }

    return ctx.reply(box('Anti Badwords',
      `📊 Status: ${cfg.enabled ? '✅ ON' : '❌ OFF'}\n` +
      `⚙️ Action: ${cfg.action}${cfg.action === 'warn' ? ` (limit ${cfg.limit})` : ''}\n` +
      `📝 Custom words: ${cfg.custom.length}\n\n` +
      `Usage:\n${ctx.prefix}antibadword on\n${ctx.prefix}antibadword off`));
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2. BADWORDACTION (delete / warn / kick)
// ═══════════════════════════════════════════════════════════════════
export const badwordaction = {
  name: 'badwordaction',
  aliases: ['bwaction'],
  groupOnly: true,
  async run(ctx) {
    if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);

    const action = (ctx.args[0] || '').toLowerCase();
    if (!ACTIONS.includes(action)) {
      return ctx.reply(box('Badword Action',
        `Usage:\n${ctx.prefix}badwordaction delete\n${ctx.prefix}badwordaction warn 3\n${ctx.prefix}badwordaction kick`));
    }

    const update = { antibadwords_action: action };
    let extra = '';
    if (action === 'warn') {
      const n = parseInt(ctx.args[1], 10);
      const limit = n >= 1 && n <= 10 ? n : DEFAULT_LIMIT;
      update.antibadwords_limit = limit;
      extra = `\nWarn limit: ${limit}`;
    }
    await saveGroupSettings(ctx.from, update);
    await ctx.react('✅');
    await ctx.reply(box('Badword Action', `✅ Action set: *${action}*${extra}`));
  }
};

// ═══════════════════════════════════════════════════════════════════
// 3. ADDBADWORD
// ═══════════════════════════════════════════════════════════════════
export const addbadword = {
  name: 'addbadword',
  aliases: ['addbw'],
  groupOnly: true,
  async run(ctx) {
    if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);

    const words = ctx.args.map((w) => norm(w).replace(/[^\p{L}\p{M}]/gu, '')).filter((w) => w.length >= 2);
    if (!words.length) return ctx.reply(`> ⚠️ Usage: ${ctx.prefix}addbadword <word1> <word2>`);

    const cfg = await getBwSettings(ctx.from);
    const list = [...new Set([...cfg.custom, ...words])];
    await saveGroupSettings(ctx.from, { antibadwords_list: list });
    await ctx.react('✅');
    await ctx.reply(box('Add Badword', `✅ ${words.length} word add hue.\n📝 Total custom: ${list.length}`));
  }
};

// ═══════════════════════════════════════════════════════════════════
// 4. DELBADWORD
// ═══════════════════════════════════════════════════════════════════
export const delbadword = {
  name: 'delbadword',
  aliases: ['delbw', 'rmbadword'],
  groupOnly: true,
  async run(ctx) {
    if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);

    const words = ctx.args.map((w) => norm(w).replace(/[^\p{L}\p{M}]/gu, '')).filter(Boolean);
    if (!words.length) return ctx.reply(`> ⚠️ Usage: ${ctx.prefix}delbadword <word>`);

    const cfg = await getBwSettings(ctx.from);
    const list = cfg.custom.filter((w) => !words.includes(norm(w)));
    const removed = cfg.custom.length - list.length;
    if (!removed) return ctx.reply(box('Del Badword', `❌ Ye word custom list mein nahi hai.\n(Default words hata nahi sakte.)`));

    await saveGroupSettings(ctx.from, { antibadwords_list: list });
    await ctx.react('✅');
    await ctx.reply(box('Del Badword', `✅ ${removed} word remove hue.\n📝 Total custom: ${list.length}`));
  }
};

// ═══════════════════════════════════════════════════════════════════
// 5. BADWORDS (list)
// ═══════════════════════════════════════════════════════════════════
export const badwords = {
  name: 'badwords',
  aliases: ['listbadwords', 'bwlist'],
  groupOnly: true,
  async run(ctx) {
    if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);

    const cfg = await getBwSettings(ctx.from);
    const custom = cfg.custom.length ? cfg.custom.map((w) => `▸ ${w}`).join('\n') : '— koi nahi —';
    await ctx.reply(box('Badwords',
      `📊 Status: ${cfg.enabled ? '✅ ON' : '❌ OFF'}\n` +
      `⚙️ Action: ${cfg.action}\n` +
      `🧱 Default list: ${DEFAULT_BADWORDS.length} words (English + Urdu + Punjabi)\n\n` +
      `📝 *Custom words (${cfg.custom.length}):*\n${custom}`));
  }
};

// ═══════════════════════════════════════════════════════════════════
// 6. RESETBADWORDS
// ═══════════════════════════════════════════════════════════════════
export const resetbadwords = {
  name: 'resetbadwords',
  aliases: ['resetbw'],
  groupOnly: true,
  async run(ctx) {
    if (!(await isAdmin(ctx))) return ctx.reply(`> ❌ Admin Only!`);

    await saveGroupSettings(ctx.from, { antibadwords_list: [], antibadwords_warns: {} });
    await ctx.react('🧹');
    await ctx.reply(box('Reset Badwords', `🧹 Custom words aur sab warnings clear ho gayi.`));
  }
};

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🍌 BANANA.JS — ARSLAN MDX · Banana Roast Plugin (v1)            ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Commands (5):                                                   ║
 * ║    • banana / kela          → general banana roast               ║
 * ║    • kelakhagia / gusail    → angry friend ("kela khaya hai?")   ║
 * ║    • bananalover / kelapremi→ banana lover roast                 ║
 * ║    • breakingnews / khabar  → breaking news with dynamic name    ║
 * ║    • selfbanana / selfkela  → self roast (khud pe hasi)          ║
 * ║                                                                  ║
 * ║  🎯 Group: @mention ya reply · 💬 DM: chat partner                ║
 * ║  🛡️ Bot / Owner target → UNO REVERSE (auto)                      ║
 * ║  ⏱️  Cooldown: 3s per user                                       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { normalizeMessageContent } from '@whiskeysockets/baileys';
import { CONFIG } from '../config.js';
import logger from '../utils/logger.js';

// ══════════════════════════════════════════════════════════════════
//  📚  CONTENT POOLS
// ══════════════════════════════════════════════════════════════════

const BANANA_ROASTS = [
  'Tum wo ho jo *kela kha ke* bhi kele jaisa hai — seedha, bekaar, aur peel pe phisalta hai 🍌',
  'Bhai tum *kela* ho — bahar se fresh, andar se khaali 🍌',
  'Tumhari *akal* kela jaisi hai — chhoti, peel mein, aur khatam 🍌',
  'Tum *kela* khate ho ya *kela* khud ho? 🍌 Confusion hai',
  'Tumhari personality *kela* jaisi hai — sab ke ghar mein milti hai, koi special nahi 🍌',
  'Tum *kele* ki tarah ho — thore der ke liye fresh, phir kaale 🍌🖤',
  'Bhai teri *soch* kela hai — muh mein acha, nigal ke dekho toh kuch nahi 🍌',
  'Tum *kela* ho — 1 din mein 2-3 baar khaya jaata hai, phir phaink diya 🍌🗑️',
  'Tumhari *life* kela jaisi hai — koi seriously nahi leta 🍌',
  'Bhai tum *kela* ho — log tumhe dekhte hain, khush hote hain, phir bhool jate hain 🍌',
  'Tum *kele* ki tarah ho — peel achi, andar se kachcha 🍌',
  'Tumhari *baaton* mein dum nahi, sirf kela hai 🍌',
  'Tum *kela* ho — roz subah dikhte ho, par koi zaroorat nahi padti 🍌',
  'Bhai ka *kela* khatam ho gaya lagta hai — dimaag bhi saath chala gaya 🍌🧠',
  'Tumhari *energy* kela jaisi hai — 5 minute, phir khatam 🍌⚡',
  'Bhai tum *kela* ho — muh mein acha lagta hai, par pet bharne ke kaam nahi aata 🍌',
  'Tumhari *fitness* kela jaisi hai — curve achi, andar se khaali 🍌',
  'Bhai tum *kela* kha ke *kela* ban gaye ho 🍌➡️🍌',
  'Tum wo *kela* ho jo dukan mein sabse upar rakha hota hai — sab dekhte hain, koi kharidta nahi 🍌',
  'Tumhari *soch* ka *level* kela hai — bas *yellow* aur *khaali* 🍌💛',
];

const KELA_KHAGIA = [
  'Bhai ko *kela kha liya* lagta hai 🍌😤 — gussa utar ke doosri taraf chala gaya',
  'Ye *kela khane* wala hai — 1 minute mein hi mood swing 🍌📈📉',
  '*Kela alert!* 🚨 Ye banda apna kela khud kha gaya, ab hume roast kar raha hai 😂',
  'Gussa? Bhai, *kela kha le* — thora thanda ho jayega 🍌❄️',
  'Ye *kela kha ke* aaya hai — abhi bhi muh mein taste hai 😤🍌',
  'Bhai ka *kela break* ho gaya lagta hai — gussa full on 🍌💥',
  '*Kela mode activated* 🍌🔥 — bhai ki taqat ka source kela hai',
  'Aaj *kela* kha ke aya hai ya *mirch*? 🌶️🍌 Gussa itna kyun?',
  'Ye *kela khane* wala banda hai — kela khatam, gussa shuru 🍌➡️😡',
  'Bhai ko *kela* chahiye — gussa 2 minute mein khatam ho jayega 🍌😌',
  'Bhai ka *kela khatam* — gussa full 🍌📉😡',
  'Ye banda *kela khata* hai, isi liye itna *soft* hai andar se 🍌🥺',
  '*Kela khaya* hai kya? Upar se itna *sour* kyun? 🍌😖',
  'Bhai ko *kela* kha ke *calm down* karna chahiye 🍌🧘',
  'Ye *kela khane wale* ka *gussa* — 1 minute ke liye, phir *kela* wapas 🍌😤',
  'Bhai ke *kela* ki *peel* pe phisal gaya — ab gussa kar raha hai 🍌😅',
  '*Kela energy* full — gussa bhi full 🍌⚡😤',
  'Bhai ke *kela* ki *quality* kharab hai — gussa zyada hai 🍌📉',
  'Aaj *kela kha* ke aya hai, phir bhi *angry* — kya logic hai bhai 🍌🤔',
  'Bhai ko *kela* ki *addiction* hai — 1 kela kam, gussa zyada 🍌📉😡',
];

const BANANA_LOVER = [
  'Ye *banana lover* hai 🍌💕 — kele ke bina din nahi guzarta',
  '*Kela premi* detected 🍌❤️ — har waqt kele ke sapne',
  'Is bande ka *true love* kela hai 🍌💘 — insaan to side character hai',
  '*Banana lover* spotted 🍌😍 — kele ki smell aate hi khush',
  'Ye banda *kele se shaadi* karne wala hai 🍌💍 — baaki sab timepass',
  'Is *kela premi* ka *dil* kela hai 🍌 — khud hi kha jata hai 😂',
  '*Kela prem* ki *peak* pe hai ye banda 🍌💯 — roz 5 kela minimum',
  'Ye *banana lover* hai — *chocolate* se bhi zyada *kela* pasand 🍌🍫',
  'Is bande ke *room* mein *kela* hi *kela* milega 🍌🔍 — baaki sab khali',
  '*Kela lover* alert 🚨🍌 — insaan nahi, kela *enthusiast*',
  'Ye banda *kele* ka *brand ambassador* ban sakta hai 🍌🎖️',
  '*Banana lover* ki *degree* hai 🍌🎓 — 10 saal kele kha ke',
  'Is bande ka *WiFi password* bhi *kela123* hoga 🍌🔐',
  '*Kela prem* inko *religion* jaisa hai 🍌🙏',
  '*Banana lover* — *kela* ka *stalker* 🍌👀',
  'Is bande ke *bag* mein hamesha *kela* hota hai 🍌🎒 — emergency ke liye',
  '*Kela* inke *dil* mein hai — aur *dil* kela hai 🍌💘',
  'Ye banda *kele pe research* kar raha hai 🍌🔬 — *PhD* in *banana*',
  '*Banana lover* — *kela* ki *tasveer* laga ke sota hai 🍌🖼️',
  'Is bande ka *favorite color* bhi *yellow* hai 🍌💛 — sab kela',
];

const REVERSE_INTROS = [
  '🍌 *UNO REVERSE!* Bot pe kela phenka? Wapas tumhare muh mein 🍌😎',
  '🛡️ *Shield on!* Bot ko kela? Bot khud kela hai bhai, tumhe kya hoga 😏',
  '↩️ *Reverse card!* Bot pe banana attack? Ulta tum pe 🍌',
  '🚨 *KELA COUNTER-ATTACK!* Bot ko roast karne chale thay? Ab tum khud kela ho 🍌😤',
];

// ══════════════════════════════════════════════════════════════════
//  🧠  HELPERS
// ══════════════════════════════════════════════════════════════════

const lastPick = new Map();
function pick(name, pool) {
  let i = Math.floor(Math.random() * pool.length);
  if (pool.length > 1 && i === lastPick.get(name)) i = (i + 1) % pool.length;
  lastPick.set(name, i);
  return pool[i];
}

const digits = (jid) =>
  String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

// 🎯 Target: @mention → reply wala → DM chat partner
function getTarget(ctx) {
  try {
    const content =
      normalizeMessageContent(ctx.msg?.message) || ctx.msg?.message || {};
    const info = Object.values(content).find(
      (v) => v && typeof v === 'object' && v.contextInfo
    )?.contextInfo;
    if (info?.mentionedJid?.[0]) return info.mentionedJid[0];
    if (info?.quotedMessage && info.participant) return info.participant;
  } catch (err) {
    logger.error(`[BANANA] target parse failed: ${err.message}`);
  }
  if (!ctx.isGroup) return ctx.from;
  return null;
}

// 🛡️ Bot / owner protect zone
function isProtected(ctx, targetJid) {
  const t = digits(targetJid);
  const requesterIsAdminSide = ctx.msg?.key?.fromMe === true || ctx.isOwner;
  if (requesterIsAdminSide) return false;
  return (
    t === digits(ctx.botNumber) || t === digits(CONFIG.OWNER_NUMBER)
  );
}

// ⏱️ Cooldown (3s per user)
const cooldown = new Map();
function onCooldown(ctx) {
  const key = digits(ctx.sender) || ctx.from;
  const now = Date.now();
  if (now - (cooldown.get(key) || 0) < 3000) return true;
  cooldown.set(key, now);
  if (cooldown.size > 500) cooldown.delete(cooldown.keys().next().value);
  return false;
}

// 📝 Final message format
function format(ctx, emoji, title, targetJid, body) {
  const tag = ctx.isGroup && targetJid ? `@${digits(targetJid)}\n` : '';
  return (
    `${emoji} *${title}*\n\n` +
    `${tag}${body}\n\n` +
    `_Mazaq hai, dil pe mat lena_ 😄\n\n` +
    `> 🍌 Powered by ARSLAN MD`
  );
}

// ══════════════════════════════════════════════════════════════════
//  🏭  COMMAND FACTORY
// ══════════════════════════════════════════════════════════════════

function createBananaCommand({ name, aliases, emoji, title, pool, selfOnly = false }) {
  return {
    name,
    aliases,
    async run(ctx) {
      let target = selfOnly ? ctx.sender : getTarget(ctx);

      // Group mein target nahi mila
      if (!target && !selfOnly) {
        return ctx.reply(
          `${emoji} *${title}*\n\n` +
            `Kisi ko *@mention* karo ya uske message ko reply karke *${ctx.prefix}${name}* likho.\n` +
            `Khud ko roast: *${ctx.prefix}selfbanana*\n` +
            `Breaking news: *${ctx.prefix}breakingnews @user*`
        );
      }

      if (onCooldown(ctx)) return;

      try {
        await ctx.react(emoji);

        // 🛡️ Bot / owner targeted → UNO REVERSE
        if (!selfOnly && isProtected(ctx, target)) {
          const intro = pick('reverse', REVERSE_INTROS);
          const mine = ctx.sender;
          const burn = pick('kelakhagia', KELA_KHAGIA);
          const body = `${intro}\n\n${ctx.isGroup ? `@${digits(mine)}\n` : ''}${burn}`;
          return ctx.reply(
            `😈 *UNO REVERSE*\n\n${body}\n\n> 🍌 Powered by ARSLAN MD`,
            { mentions: [mine] }
          );
        }

        const body = pick(name, pool);
        const text = format(ctx, emoji, title, target, body);
        await ctx.reply(text, { mentions: target ? [target] : [] });
      } catch (err) {
        logger.error(`[BANANA] ${name} failed: ${err.message}`);
      }
    },
  };
}

// ══════════════════════════════════════════════════════════════════
//  🚨  BREAKING NEWS — dynamic name
// ══════════════════════════════════════════════════════════════════
export const breakingnews = {
  name: 'breakingnews',
  aliases: ['news', 'khabar', 'breaking', 'banananews'],
  async run(ctx) {
    await ctx.react('🚨');

    let target = getTarget(ctx);
    if (!target) {
      return ctx.reply(
        `🚨 *BREAKING NEWS*\n\n` +
          `Kisi ko *@mention* karo ya uske message ko reply karke *${ctx.prefix}breakingnews* likho.\n\n` +
          `> 🍌 Powered by ARSLAN MD`
      );
    }

    if (onCooldown(ctx)) return;

    // Agar bot/owner target kiya → news unki apni (sender ki) ban jati hai
    if (isProtected(ctx, target)) {
      target = ctx.sender;
    }

    const name = digits(target) || 'kisi ka naam';

    const text =
      `*🚨 𝗕𝗥𝗘𝗔𝗞𝗜𝗡𝗚 𝗡𝗘𝗪𝗦 🚨*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📍 *Bahawalpur, Pakistan*\n` +
      `> Kele ki kami hone ki wajah samne aa gayi hai.\n\n` +
      `> Bahawalpur ke rehne wale *@${name}* ne kele kha kha ke khatam kar diye.\n\n` +
      `> Aur ye kam tha to upar se *podi laga li* aur us pe *beth gaya* 🥒💀\n\n` +
      `> Uff! Acha hota ke meri *godh mein* beth jata 🥺 Podi lagani zaroori thi? 😂\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `> 📰 *ARSLAN NEWS · LIVE*\n` +
      `> 🍌 _Mazaq hai, dil pe mat lena_ 😄`;

    await ctx.reply(text, { mentions: [target] });
  },
};

// ══════════════════════════════════════════════════════════════════
//  📦  COMMANDS
// ══════════════════════════════════════════════════════════════════

/** General banana roast */
export const banana = createBananaCommand({
  name: 'banana',
  aliases: ['kela', 'kelaroast', 'bananaroast'],
  emoji: '🍌',
  title: 'BANANA ROAST',
  pool: BANANA_ROASTS,
});

/** Angry friend — "kela khaya hai?" */
export const kelakhagia = createBananaCommand({
  name: 'kelakhagia',
  aliases: ['kela_khagia', 'gusail', 'angry', 'kelakhaya', 'gussawala'],
  emoji: '😤',
  title: 'KELA KHA GAYA HAI?',
  pool: KELA_KHAGIA,
});

/** Banana lover roast */
export const bananalover = createBananaCommand({
  name: 'bananalover',
  aliases: ['kelalover', 'kelapremi', 'bananaloverdetected'],
  emoji: '💛',
  title: 'BANANA LOVER DETECTED',
  pool: BANANA_LOVER,
});

/** Self roast (selfOnly) */
export const selfbanana = createBananaCommand({
  name: 'selfbanana',
  aliases: ['selfkela', 'bananame', 'kelame'],
  emoji: '🪞',
  title: 'SELF BANANA ROAST',
  pool: BANANA_ROASTS,
  selfOnly: true,
});
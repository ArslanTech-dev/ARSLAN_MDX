import { askGPT, generateImage } from '../lib/ai.js';
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

// ⏱️ Cooldown (5s per user)
const cooldown = new Map();
const digits = (jid) => String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');
function onCooldown(ctx) {
  const key = digits(ctx.sender) || ctx.from;
  const now = Date.now();
  if (now - (cooldown.get(key) || 0) < 5000) return true;
  cooldown.set(key, now);
  if (cooldown.size > 500) cooldown.delete(cooldown.keys().next().value);
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// 1. GPT (Text AI)
// ═══════════════════════════════════════════════════════════════════
export const gpt = {
  name: 'gpt',
  aliases: ['ai', 'chatgpt'],
  async run(ctx) {
    const prompt = ctx.args.join(' ').trim();
    if (!prompt) return ctx.reply(`> ⚠️ *${bold('USAGE')}*\n> ╰─➤ \`.${ctx.prefix}gpt <question>\``);

    if (onCooldown(ctx)) return;
    try { await ctx.react('🧠'); } catch {}

    let waitMsg;
    try {
        waitMsg = await ctx.reply(`> 🧠 *${bold('AI THINKING...')}*\n> ╰─➤ \`${prompt.substring(0, 30)}...\``);
    } catch (e) {}

    try {
      const reply = await askGPT(prompt);
      
      if (waitMsg) await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});

      const caption = `> 🤖 *${bold('ARSLAN MDX AI')}*\n` +
                      `> ────────────────\n` +
                      `${reply}\n` +
                      `> ────────────────\n` +
                      `> 💫 _POWERED BY ARSLAN MD_ 💫`;
                      
      await ctx.reply(caption);
      try { await ctx.react('✅'); } catch {}
    } catch (err) {
      if (waitMsg) await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});
      logger.error(`[GPT] Error: ${err.message}`);
      try { await ctx.react('❌'); } catch {}
      await ctx.reply(`> ❌ *${bold('ERROR')}*\n> ╰─➤ ${err.message}`);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2. IMAGINE (Image AI)
// ═══════════════════════════════════════════════════════════════════
export const imagine = {
  name: 'imagine',
  aliases: ['dalle', 'aiimage'],
  async run(ctx) {
    const prompt = ctx.args.join(' ').trim();
    if (!prompt) return ctx.reply(`> ⚠️ *${bold('USAGE')}*\n> ╰─➤ \`.${ctx.prefix}imagine <description>\``);

    if (onCooldown(ctx)) return;
    try { await ctx.react('🎨'); } catch {}

    let waitMsg;
    try {
        waitMsg = await ctx.reply(`> 🎨 *${bold('GENERATING IMAGE...')}*\n> ╰─➤ \`${prompt.substring(0, 30)}...\`\n> _Please wait up to 20s..._`);
    } catch (e) {}

    try {
      const imageUrl = await generateImage(prompt);

      if (waitMsg) await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});

      const caption = `> 🎨 *${bold('AI IMAGE GENERATED')}*\n` +
                      `> ────────────────\n` +
                      `> 📝 \`Prompt : ${prompt}\`\n` +
                      `> ────────────────\n` +
                      `> 💫 _POWERED BY ARSLAN MD_ 💫`;

      await ctx.send({
        image: { url: imageUrl },
        caption: caption
      });

      try { await ctx.react('✅'); } catch {}
    } catch (err) {
      if (waitMsg) await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});
      logger.error(`[IMAGINE] Error: ${err.message}`);
      try { await ctx.react('❌'); } catch {}
      await ctx.reply(`> ❌ *${bold('ERROR')}*\n> ╰─➤ ${err.message}`);
    }
  }
};
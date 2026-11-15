/**
 * ═══════════════════════════════════════════════════════════════════
 * 🛡️ GROUPGUARD.js — ARSLAN MDX · Group guard switches (ON/OFF)
 * Commands (5): antilink, linkaction, welcome, goodbye, guardstatus
 *
 * handlers/message.js jin cheezon ko chalata hai unke ON/OFF yahan se hote hain:
 *   .antilink on|off|status        → group mein link delete
 *   .linkaction delete|warn|kick   → link bhejne walay ka action
 *   .welcome on|off                → naye member ka welcome
 *   .goodbye on|off                → member ke jaane par goodbye
 *   .guardstatus                   → sab settings ek nazar mein
 * Sirf group admin (ya bot owner) chala sakta hai.
 * ═══════════════════════════════════════════════════════════════════
 */

import { getGroupSettings, saveGroupSettings } from '../utils/database.js';
import { isUserAdmin, isBotAdminIn, collectSenderIds } from '../utils/groupHelper.js';

// ───────────────────────── Style helpers ─────────────────────────
const SC = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ',
  k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ',
  u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};
const sc = (s) => String(s).toLowerCase().replace(/[a-z]/g, (c) => SC[c]);
const FOOTER = `> 💫 _*© ${sc('powered by arslan-mdx')}*_`;
const box = (title, rows) =>
  `╔═════ ⌈ *${title}* ⌋ ═════✧\n${rows.map((r) => `║ ${r}`).join('\n')}\n╚══════════════════════✧\n\n${FOOTER}`;

const onOff = (v) => (v ? `✅ ${sc('on')}` : `❌ ${sc('off')}`);
const ACTIONS = ['delete', 'warn', 'kick'];

async function isAdmin(ctx) {
  if (ctx.isOwner) return true;
  if (!ctx.isGroup) return false;
  return isUserAdmin(ctx.sock, ctx.from, collectSenderIds(ctx.msg, ctx.sender));
}

async function guardAccess(ctx) {
  if (!(await isAdmin(ctx))) {
    await ctx.reply('> ❌ Admin Only!');
    return false;
  }
  return true;
}

// on/off/status wala common toggle
function createToggle({ name, aliases, emoji, key, title, onText, offText, needsBotAdmin = false }) {
  return {
    name,
    aliases,
    groupOnly: true,
    async run(ctx) {
      if (!(await guardAccess(ctx))) return;
      const arg = (ctx.args[0] || '').toLowerCase();
      const current = await getGroupSettings(ctx.from);

      if (arg === 'on' || arg === 'off') {
        const value = arg === 'on';
        await saveGroupSettings(ctx.from, { [key]: value });
        await ctx.react(emoji);

        let extra = '';
        if (value && needsBotAdmin && !(await isBotAdminIn(ctx.sock, ctx.from))) {
          extra = `\n> ⚠️ Bot ko *admin* banao, warna delete nahi kar sakega.`;
        }
        return ctx.reply(
          box(`${emoji} ${sc(title)}`, [
            `🔘 *${sc('status:')}* ${onOff(value)}`,
            `📝 ${value ? onText : offText}`
          ]) + extra
        );
      }

      return ctx.reply(
        box(`${emoji} ${sc(title)}`, [
          `🔘 *${sc('status:')}* ${onOff(!!current[key])}`,
          `💡 *${sc('use:')}* ${ctx.prefix}${name} on / off`
        ])
      );
    }
  };
}

export const antilink = createToggle({
  name: 'antilink',
  aliases: ['antilinks', 'nolink'],
  emoji: '🔗',
  key: 'antilink',
  title: 'anti link',
  onText: 'Ab group mein link bhejne par message delete hoga.',
  offText: 'Link allowed hain.',
  needsBotAdmin: true
});

export const welcome = createToggle({
  name: 'welcome',
  aliases: ['welcomemsg'],
  emoji: '💚',
  key: 'welcome',
  title: 'welcome',
  onText: 'Naye member ka welcome hoga.',
  offText: 'Welcome band.'
});

export const goodbye = createToggle({
  name: 'goodbye',
  aliases: ['byemsg', 'leftmsg'],
  emoji: '💔',
  key: 'goodbye',
  title: 'goodbye',
  onText: 'Member jaane par goodbye message aayega.',
  offText: 'Goodbye band.'
});

export const linkaction = {
  name: 'linkaction',
  aliases: ['antilinkaction'],
  groupOnly: true,
  async run(ctx) {
    if (!(await guardAccess(ctx))) return;
    const arg = (ctx.args[0] || '').toLowerCase();
    const current = (await getGroupSettings(ctx.from)).antilink_action || 'warn';

    if (!ACTIONS.includes(arg)) {
      return ctx.reply(
        box(`⚙️ ${sc('link action')}`, [
          `🔘 *${sc('current:')}* ${sc(current)}`,
          `◈ delete → sirf message delete`,
          `◈ warn → delete + warning (3 warnings par kick)`,
          `◈ kick → delete + seedha remove`,
          `💡 ${ctx.prefix}linkaction delete | warn | kick`
        ])
      );
    }

    await saveGroupSettings(ctx.from, { antilink_action: arg });
    await ctx.react('⚙️');
    return ctx.reply(box(`⚙️ ${sc('link action')}`, [`✅ *${sc('set:')}* ${sc(arg)}`]));
  }
};

export const guardstatus = {
  name: 'guardstatus',
  aliases: ['groupguard', 'guard'],
  groupOnly: true,
  async run(ctx) {
    if (!(await guardAccess(ctx))) return;
    const s = await getGroupSettings(ctx.from);
    const botAdmin = await isBotAdminIn(ctx.sock, ctx.from);
    await ctx.react('🛡️');
    return ctx.reply(
      box(`🛡️ ${sc('group guard')}`, [
        `🤖 *${sc('bot admin:')}* ${botAdmin ? '✅ ' + sc('yes') : '❌ ' + sc('no')}`,
        `🔗 *${sc('antilink:')}* ${onOff(!!s.antilink)} (${sc(s.antilink_action || 'warn')})`,
        `🚫 *${sc('antibadwords:')}* ${onOff(!!s.antibadwords)}`,
        `💚 *${sc('welcome:')}* ${onOff(!!s.welcome)}`,
        `💔 *${sc('goodbye:')}* ${onOff(!!s.goodbye)}`
      ])
    );
  }
};

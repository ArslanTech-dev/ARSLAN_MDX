/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🛡️ SECURITY.JS — ARSLAN MDX · Antidelete & Anticall Toggles     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Commands (2): antidelete (ad) · anticall (ac)                   ║
 * ║                                                                  ║
 * ║  Owner-only, but with explicit feedback for non-owners.          ║
 * ║  Persistence verified after write — DB failure surface to user.  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { readDb, writeDb } from '../utils/database.js';
import logger from '../utils/logger.js';

// ═══════════════════════════════════════════════════════════════════
// 🔤 BOLD SERIF FONT (matches general.js / image.js)
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
// 🔧 TOGGLE HELPER — with persistence verification
// ═══════════════════════════════════════════════════════════════════
async function toggleSetting(setting, action) {
  const want = action === 'on';

  try {
    const db = (await readDb()) || {};
    if (!db.global_settings) db.global_settings = {};
    db.global_settings[setting] = want;

    await writeDb(db);

    // ✅ Verify persistence
    const check = await readDb();
    const persisted = check?.global_settings?.[setting] === want;

    logger.info(
      `[SECURITY] ${setting} → ${want} | Persisted: ${persisted}`
    );

    return { value: want, persisted };
  } catch (err) {
    logger.error(`[SECURITY] toggle failed (${setting}): ${err.message}`);
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📝 SHARED COMMAND FACTORY
// ═══════════════════════════════════════════════════════════════════
function makeToggleCommand({ name, aliases, setting, label, emoji }) {
  return {
    name,
    aliases,
    // ⚠️ NOTE: ownerOnly removed — check inside run() for feedback
    async run(ctx) {
      // ─── 1. Owner check (explicit feedback) ───
      if (!ctx.isOwner) {
        return ctx.reply(
          `> ❌ *${bold('ACCESS DENIED')}*\n` +
          `> ────────────────\n` +
          `> 👤 \`Sender: ${ctx.sender}\`\n` +
          `> 👑 \`Owner : ${ctx.botNumber || 'unknown'}\`\n` +
          `> ────────────────\n` +
          `> Ye command sirf *owner* use kar sakta hai.`
        );
      }

      // ─── 2. Argument validation ───
      const action = (ctx.args[0] || '').toLowerCase().trim();
      if (action !== 'on' && action !== 'off') {
        return ctx.reply(
          `> ⚠️ *${bold('USAGE')}*\n` +
          `> ────────────────\n` +
          `> ▸ \`${ctx.prefix}${name} on\`\n` +
          `> ▸ \`${ctx.prefix}${name} off\`\n` +
          `> ────────────────\n` +
          `> 💫 _Powered by ARSLAN MD_`
        );
      }

      // ─── 3. React (visual feedback) ───
      try { await ctx.react(emoji); } catch {}

      // ─── 4. Apply toggle ───
      try {
        const { value, persisted } = await toggleSetting(setting, action);

        if (!persisted) {
          return ctx.reply(
            `> ⚠️ *${bold('WARNING')}*\n` +
            `> ────────────────\n` +
            `> Toggle ${value ? 'ON' : 'OFF'} set ho gaya,\n` +
            `> lekin *DB mein save nahi hua*.\n` +
            `> \`utils/database.js\` ke \`writeDb\` ko check karo.\n` +
            `> ────────────────\n` +
            `> 💫 _Powered by ARSLAN MD_`
          );
        }

        const statusEmoji = value ? '🟢' : '🔴';
        const statusText = value ? 'ON' : 'OFF';
        const statusHint = value
          ? `> ✅ ${emoji} Feature ab *active* hai`
          : `> 🚫 ${emoji} Feature ab *disabled* hai`;

        await ctx.reply(
          `> ${statusEmoji} *${bold(label)} — ${bold(statusText)}*\n` +
          `> ────────────────\n` +
          `> ${statusHint}\n` +
          `> ────────────────\n` +
          `> 💫 _Powered by ARSLAN MD_`
        );

        try { await ctx.react(value ? '✅' : '❌'); } catch {}
      } catch (err) {
        // ─── 5. Error feedback ───
        try { await ctx.react('❌'); } catch {}
        await ctx.reply(
          `> ❌ *${bold('ERROR')}*\n` +
          `> ────────────────\n` +
          `> \`${err.message}\`\n` +
          `> ────────────────\n` +
          `> 💫 _Powered by ARSLAN MD_`
        );
      }
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// 📦 COMMANDS
// ═══════════════════════════════════════════════════════════════════
export const antidelete = makeToggleCommand({
  name: 'antidelete',
  aliases: ['ad'],
  setting: 'antiDelete',
  label: 'ANTIDELETE',
  emoji: '🛡️',
});

export const anticall = makeToggleCommand({
  name: 'anticall',
  aliases: ['ac'],
  setting: 'antiCall',
  label: 'ANTICALL',
  emoji: '📵',
});
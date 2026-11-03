/**
 * ═══════════════════════════════════════════════════════════════════
 * 🛡️ SECURITY.JS — Toggles for Antidelete & Anticall
 * ═══════════════════════════════════════════════════════════════════
 */
import { readDb, writeDb } from '../utils/database.js';

// Helper to change settings
async function toggleSetting(setting, action) {
  const db = await readDb();
  if (!db.global_settings) db.global_settings = {};
  db.global_settings[setting] = (action === 'on');
  await writeDb(db);
  return action === 'on';
}

// .antidelete on/off
export const antidelete = {
  name: 'antidelete',
  aliases: ['ad'],
  ownerOnly: true,
  async run(ctx) {
    const action = ctx.args[0]?.toLowerCase();
    if (action !== 'on' && action !== 'off') {
      return ctx.reply(`> ⚠️ *USAGE*\n> ╰─➤ ${ctx.prefix}antidelete on/off`);
    }
    const isOn = await toggleSetting('antiDelete', action);
    await ctx.reply(`> ${isOn ? '✅' : '❌'} *Antidelete is now ${isOn ? 'ON' : 'OFF'}*`);
  }
};

// .anticall on/off
export const anticall = {
  name: 'anticall',
  aliases: ['ac'],
  ownerOnly: true,
  async run(ctx) {
    const action = ctx.args[0]?.toLowerCase();
    if (action !== 'on' && action !== 'off') {
      return ctx.reply(`> ⚠️ *USAGE*\n> ╰─➤ ${ctx.prefix}anticall on/off`);
    }
    const isOn = await toggleSetting('antiCall', action);
    await ctx.reply(`> ${isOn ? '✅' : '❌'} *Anticall is now ${isOn ? 'ON' : 'OFF'}*`);
  }
};
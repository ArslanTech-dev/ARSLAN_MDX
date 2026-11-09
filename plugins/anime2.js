/**
 * ═══════════════════════════════════════════════════════════════════
 * 📦 ANIME2.js — ARSLAN MDX Anime Action Commands (v3 — fixed)
 * Commands (8): kiss, hug, slap, pat, cuddle, blush, smile, wave
 * Tip: kisi ko @mention karo ya uske message ko reply karke cmd likho.
 * ═══════════════════════════════════════════════════════════════════
 */

import { normalizeMessageContent } from '@whiskeysockets/baileys';
import { getAnimeVideoBuffer } from '../lib/animeReaction.js';
import logger from '../utils/logger.js';

// 🚀 Safe react (message expired etc. pe crash na kare)
const safeReact = async (ctx, emoji) => {
  try {
    await ctx.react(emoji);
  } catch {
    // ignore
  }
};

// 🚀 Target user: pehle @mention, warna reply kiye gaye message ka sender
// (NOTE: bot ctx mein message `ctx.msg.message` hai, `ctx.message` nahi)
const getMentioned = (ctx) => {
  try {
    const content = normalizeMessageContent(ctx.msg?.message) || ctx.msg?.message || {};
    const info = Object.values(content).find((v) => v && typeof v === 'object' && v.contextInfo)?.contextInfo;
    if (!info) return null;
    const mentioned = info.mentionedJid?.[0];
    if (mentioned) return mentioned;
    if (info.quotedMessage && info.participant) return info.participant;
    return null;
  } catch {
    return null;
  }
};

// 🚀 Helper to create a command dynamically
const createActionCommand = (name, apiType, emoji, aliases = []) => {
  return {
    name,
    aliases,
    async run(ctx) {
      await safeReact(ctx, emoji);

      try {
        const videoBuffer = await getAnimeVideoBuffer(apiType);

        if (!videoBuffer || videoBuffer.length < 1000) {
          throw new Error('Empty video buffer');
        }

        const mentioned = getMentioned(ctx);
        const target = mentioned ? `\n> @${mentioned.split('@')[0].split(':')[0]}` : '';

        const caption =
          `> ${emoji} *${name.toUpperCase()}*${target}\n\n> © Powered by ARSLAN MD`;

        await ctx.send({
          video: videoBuffer,
          mimetype: 'video/mp4',
          gifPlayback: true,
          caption,
          mentions: mentioned ? [mentioned] : [],
        });

        await safeReact(ctx, '✅');
      } catch (err) {
        logger.error(`[ANIME] ${name} command failed: ${err.message}`);
        await safeReact(ctx, '❌');
        try {
          await ctx.reply(`> ❌ *Failed to fetch ${name} GIF.*`);
        } catch {
          // ignore reply failures
        }
      }
    },
  };
};

// ═══════════════════════════════════════════════════════════════════
// EXPORT ALL COMMANDS
// ═══════════════════════════════════════════════════════════════════
export const kiss   = createActionCommand('kiss',   'kiss',   '💋');
export const hug    = createActionCommand('hug',    'hug',    '🤗');
export const slap   = createActionCommand('slap',   'slap',   '🖐️', ['thappad']);
export const pat    = createActionCommand('pat',    'pat',    '🫳');
export const cuddle = createActionCommand('cuddle', 'cuddle', '🫂');
export const blush  = createActionCommand('blush',  'blush',  '😊');
export const smile  = createActionCommand('smile',  'smile',  '😁');
export const wave   = createActionCommand('wave',   'wave',   '👋');

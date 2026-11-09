/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Commands (v2 — safer + mentions)
 * ═══════════════════════════════════════════════════════════════════
 */

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

// 🚀 Extract mentioned user (Baileys pattern, safely)
const getMentioned = (ctx) => {
  try {
    const ctxInfo =
      ctx.message?.extendedTextMessage?.contextInfo ||
      ctx.message?.contextInfo ||
      null;
    const list = ctxInfo?.mentionedJid || [];
    return list[0] || null;
  } catch {
    return null;
  }
};

// 🚀 Helper to create a command dynamically
const createActionCommand = (name, apiType, emoji) => {
  return {
    name,
    aliases: [],
    async run(ctx) {
      await safeReact(ctx, emoji);

      try {
        const videoBuffer = await getAnimeVideoBuffer(apiType);

        if (!videoBuffer || videoBuffer.length < 1000) {
          throw new Error('Empty video buffer');
        }

        const mentioned = getMentioned(ctx);
        const target = mentioned ? `\n> @${mentioned.split('@')[0]}` : '';

        const caption =
          `> ${emoji} *${name.toUpperCase()}*${target}\n\n> © POWERED BY ARSLAN MD`;

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
export const slap   = createActionCommand('slap',   'slap',   '🖐️');
export const pat    = createActionCommand('pat',    'pat',    '🫳');
export const cuddle = createActionCommand('cuddle', 'cuddle', '🫂');
export const blush  = createActionCommand('blush',  'blush',  '😊');
export const smile  = createActionCommand('smile',  'smile',  '😁');
export const wave   = createActionCommand('wave',   'wave',   '👋');
/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌸 ANIME.JS — ARSLAN MDX Anime Commands
 * ═══════════════════════════════════════════════════════════════════
 */

import { getAnimeVideoBuffer } from '../lib/animeReaction.js';
import logger from '../utils/logger.js';

// 🚀 Helper to create a command dynamically
const createActionCommand = (name, apiType, emoji) => {
  return {
    name: name,
    aliases: [],
    async run(ctx) {
      await ctx.react(emoji);
      try {
        const videoBuffer = await getAnimeVideoBuffer(apiType);
        
        const caption = `> ${emoji} *${name.toUpperCase()}*\n\n> © POWERED BY ARSLAN MD`;

        await ctx.send({
          video: videoBuffer,
          mimetype: 'video/mp4',
          gifPlayback: true,
          caption: caption
        });
        
        await ctx.react('✅');
      } catch (err) {
        logger.error(`[ANIME] ${name} command failed: ${err.message}`);
        await ctx.react('❌');
        await ctx.reply(`> ❌ *Failed to fetch ${name} GIF.*`);
      }
    }
  };
};

// ═══════════════════════════════════════════════════════════════════
// EXPORT ALL COMMANDS
// ═══════════════════════════════════════════════════════════════════
export const kiss = createActionCommand('kiss', 'kiss', '💋');
export const hug = createActionCommand('hug', 'hug', '🤗');
export const slap = createActionCommand('slap', 'slap', '🖐️');
export const pat = createActionCommand('pat', 'pat', '🫳');
export const cuddle = createActionCommand('cuddle', 'cuddle', '🫂');
export const blush = createActionCommand('blush', 'blush', '😊');
export const smile = createActionCommand('smile', 'smile', '😁');
export const wave = createActionCommand('wave', 'wave', '👋');
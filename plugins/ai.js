import { askGPT, generateImage } from '../lib/ai.js';
import logger from '../utils/logger.js';

export const gpt = {
  name: 'gpt',
  aliases: ['ai', 'chatgpt'],
  async run(ctx) {
    const prompt = ctx.args.join(' ');
    if (!prompt) return ctx.reply(`> ⚠️ Usage: ${ctx.prefix}gpt <question>`);

    await ctx.react('⏳');
    try {
      const reply = await askGPT(prompt);
      await ctx.reply(`> 🤖 *ARSLAN MDX AI*\n\n${reply}\n\n> © POWERED BY ARSLAN MD`);
      await ctx.react('✅');
    } catch (err) {
      await ctx.react('❌');
      await ctx.reply(`> ❌ Error: ${err.message}`);
    }
  }
};

export const imagine = {
  name: 'imagine',
  aliases: ['dalle', 'aiimage'],
  async run(ctx) {
    const prompt = ctx.args.join(' ');
    if (!prompt) return ctx.reply(`> ⚠️ Usage: ${ctx.prefix}imagine <description>`);

    await ctx.react('🎨');
    try {
      const imageUrl = await generateImage(prompt);
      await ctx.send({
        image: { url: imageUrl },
        caption: `> 🎨 *AI IMAGE GENERATED*\n> Prompt: _${prompt}_\n\n> © POWERED BY ARSLAN MD`
      });
      await ctx.react('✅');
    } catch (err) {
      await ctx.react('❌');
      await ctx.reply(`> ❌ Error: ${err.message}`);
    }
  }
};
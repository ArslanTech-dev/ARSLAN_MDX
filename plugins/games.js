import { getTruth, getDare, get8Ball } from '../lib/games.js';

export const truth = {
  name: 'truth',
  aliases: ['t'],
  async run(ctx) {
    await ctx.react('🤫');
    await ctx.reply(`> 🫣 *TRUTH*\n> \`${getTruth()}\`\n\n> © POWERED BY ARSLAN MD`);
  }
};

export const dare = {
  name: 'dare',
  aliases: ['d'],
  async run(ctx) {
    await ctx.react('😈');
    await ctx.reply(`> 😈 *DARE*\n> \`${getDare()}\`\n\n> © POWERED BY ARSLAN MD`);
  }
};

export const eightball = {
  name: '8ball',
  aliases: ['8b'],
  async run(ctx) {
    const question = ctx.text.replace(/^\.8ball\s*/i, '').trim();
    if (!question) return ctx.reply(`> ⚠️ Usage: ${ctx.prefix}8ball Will I be rich?`);
    
    await ctx.react('🎱');
    await ctx.reply(`> ❓ *Question:* ${question}\n> 🎱 *Answer:* \`${get8Ball()}\`\n\n> © POWERED BY ARSLAN MD`);
  }
};
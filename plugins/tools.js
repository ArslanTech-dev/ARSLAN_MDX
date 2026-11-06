import { getWeather, translateText } from '../lib/tools.js';

export const weather = {
  name: 'weather',
  aliases: ['mausam'],
  async run(ctx) {
    const city = ctx.args.join(' ');
    if (!city) return ctx.reply(`> ⚠️ Usage: ${ctx.prefix}weather <city>`);

    await ctx.react('⏳');
    try {
      const data = await getWeather(city);
      const text = `> 🌤️ *WEATHER UPDATE*\n> 📍 *City:* ${data.name}, ${data.sys.country}\n> 🌡️ *Temp:* ${data.main.temp}°C\n> ☁️ *Condition:* ${data.weather[0].description}\n> 💧 *Humidity:* ${data.main.humidity}%\n\n> © POWERED BY ARSLAN MD`;
      await ctx.reply(text);
      await ctx.react('✅');
    } catch (err) {
      await ctx.react('❌');
      await ctx.reply(`> ❌ City not found or API error.`);
    }
  }
};

export const translate = {
  name: 'translate',
  aliases: ['trt'],
  async run(ctx) {
    const text = ctx.args.join(' ');
    if (!text) return ctx.reply(`> ⚠️ Usage: ${ctx.prefix}translate <text>`);

    await ctx.react('⏳');
    try {
      const translated = await translateText(text, 'ur');
      await ctx.reply(`> 🌐 *TRANSLATION*\n\n${translated}\n\n> © POWERED BY ARSLAN MD`);
      await ctx.react('✅');
    } catch (err) {
      await ctx.react('❌');
      await ctx.reply(`> ❌ Translation failed.`);
    }
  }
};
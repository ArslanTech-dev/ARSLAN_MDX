import { getSurah, getPrayerTimes } from '../lib/islamic.js';

export const quran = {
  name: 'quran',
  aliases: ['surah'],
  async run(ctx) {
    const surahNum = ctx.args[0] || '1';
    await ctx.react('📖');
    try {
      const data = await getSurah(surahNum);
      const text = `> 📖 *SURAH ${data.englishName.toUpperCase()}*\n> Arabic: ${data.name}\n> Verses: ${data.numberOfAyahs}\n\n> ${data.ayahs[0].text}\n\n> © POWERED BY ARSLAN MD`;
      await ctx.reply(text);
      await ctx.react('✅');
    } catch (err) {
      await ctx.react('❌');
      await ctx.reply(`> ❌ Surah not found. Try .quran 1`);
    }
  }
};

export const prayer = {
  name: 'prayer',
  aliases: ['namaz'],
  async run(ctx) {
    const city = ctx.args.join(' ') || 'Karachi';
    await ctx.react('🕌');
    try {
      const times = await getPrayerTimes(city);
      const text = `> 🕌 *PRAYER TIMES (${city})*\n\n> 🌅 *Fajr:* ${times.Fajr}\n> ☀️ *Dhuhr:* ${times.Dhuhr}\n> 🌤️ *Asr:* ${times.Asr}\n> 🌅 *Maghrib:* ${times.Maghrib}\n> 🌙 *Isha:* ${times.Isha}\n\n> © POWERED BY ARSLAN MD`;
      await ctx.reply(text);
      await ctx.react('✅');
    } catch (err) {
      await ctx.react('❌');
      await ctx.reply(`> ❌ Could not fetch prayer times.`);
    }
  }
};
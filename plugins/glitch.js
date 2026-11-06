/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌀 GLITCH.JS — ARSLAN MDX Ultra Glitch Effects
 * ═══════════════════════════════════════════════════════════════════
 * Commands: glitch, glitchwave, glitchart, glitchscreen, glitchmatrix, 
 * glitchv2, glitchflicker, glitchmix, glitchrain, glitchtext, glitchbomb
 */

import logger from '../utils/logger.js';

// ─── Helpers ──────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomChar = () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~'[Math.floor(Math.random() * 86)];

const glitchText = (text, intensity = 0.3) => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += Math.random() < intensity ? randomChar() : text[i];
    }
    return result;
};

const zalgoText = (text) => {
    const zalgo = ['̴', '̵', '̶', '̷', '̸', '̨', '̩', '̪', '̫', '̬', '̭', '̮', '̯', '̰', '̱', '̲', '̳', '̹', '̺', '̻', '̼', '̽', '̾', '̿', '͂', '̓', '̈́', 'ͅ'];
    let result = '';
    for (const ch of text) {
        result += ch;
        for (let i = 0; i < 3; i++) {
            if (Math.random() > 0.5) result += random(zalgo);
        }
    }
    return result;
};

const reverseText = (text) => text.split('').reverse().join('');
const randomCase = (text) => text.split('').map(ch => Math.random() > 0.5 ? ch.toUpperCase() : ch.toLowerCase()).join('');

const glitchEmojis = ['💢', '⚡', '🔥', '💀', '🌀', '🌪️', '📺', '🔮', '🕹️', '💻', '📡', '🎛️', '💥', '🌈', '🌌', '🖥️'];

// ═══════════════════════════════════════════════════════════════════
// 1. GLITCH — Basic Glitch
// ═══════════════════════════════════════════════════════════════════
export const glitch = {
  name: 'glitch',
  aliases: ['g'],
  async run(ctx) {
    const text = ctx.args.join(' ') || 'ARSLAN MD ULTRA';
    await ctx.react('⚡');

    const loadingMsg = await ctx.reply(`> ⚡ *GLITCH INITIALIZED*
> 🔍 Scanning... [░░░░░░░░░░] 0%`);

    await sleep(500);
    await ctx.send({ text: `> ⚡ *GLITCH INITIALIZED*
> 🔍 Generating glitch... [▓▓▓▓▓░░░░░] 50%`, edit: loadingMsg.key });

    await sleep(500);

    const finalText = `> ⚡ *GLITCH COMPLETE*
> 
> 🔮 *Original:* ${text}
> 💢 *Glitched:* ${glitchText(text, 0.5)}
> 🌪️ *Zalgo:* ${zalgoText(text)}
> 🔄 *Reversed:* ${reverseText(text)}
> 🔀 *Random Case:* ${randomCase(text)}
> 
> ${random(glitchEmojis)} ${random(glitchEmojis)} ${random(glitchEmojis)}
> 
> © POWERED BY ARSLAN MD`;

    await ctx.send({ text: finalText, edit: loadingMsg.key });
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2. GLITCH WAVE
// ═══════════════════════════════════════════════════════════════════
export const glitchwave = {
  name: 'glitchwave',
  aliases: ['gwave'],
  async run(ctx) {
    await ctx.react('🌊');
    const text = ctx.args.join(' ') || 'ARSLAN';

    let wave = '';
    for (let i = 0; i < 6; i++) {
      wave += `> ${glitchText(text, i * 0.15)}\n`;
    }

    const finalText = `> 🌊 *GLITCH WAVE*
> 
${wave}
> 🌪️ Glitch wave complete!
> 
> © POWERED BY ARSLAN MD`;

    await ctx.reply(finalText);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 3. GLITCH ART
// ═══════════════════════════════════════════════════════════════════
export const glitchart = {
  name: 'glitchart',
  aliases: ['gart'],
  async run(ctx) {
    await ctx.react('🎨');
    const art = [
      ' █████╗ ██████╗ ███████╗██╗      █████╗ ███╗   ██╗',
      '██╔══██╗██╔══██╗██╔════╝██║     ██╔══██╗████╗  ██║',
      '███████║██████╔╝███████╗██║     ███████║██╔██╗ ██║',
      '██╔══██║██╔══██╗╚════██║██║     ██╔══██║██║╚██╗██║',
      '██║  ██║██║  ██║███████║███████╗██║  ██║██║ ╚████║',
      '╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝'
    ];

    let glitchedArt = '';
    for (const line of art) {
      glitchedArt += `> ${glitchText(line, 0.25)}\n`;
    }

    const finalText = `> 🎨 *GLITCH ART*
> 
${glitchedArt}
> 🎛️ Glitch Level: ${Math.floor(Math.random() * 100)}%
> 
> © POWERED BY ARSLAN MD`;

    await ctx.reply(finalText);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 4. GLITCH SCREEN
// ═══════════════════════════════════════════════════════════════════
export const glitchscreen = {
  name: 'glitchscreen',
  aliases: ['gscreen'],
  async run(ctx) {
    await ctx.react('📺');

    const msg = await ctx.reply(`> 📺 *GLITCH SCREEN*
> 📺 Flickering...
> 🟥🟩🟦🟪🟧🟫🟥🟩🟦🟪🟧🟫
> 🟫🟧🟪🟦🟩🟥🟫🟧🟪🟦🟩🟥`);

    await sleep(500);
    await ctx.send({ text: `> 📺 *GLITCH SCREEN*
> 📺 Glitch lines...
> ████░░░░████░░░░████
> ░░░░████░░░░████░░░░`, edit: msg.key });

    await sleep(500);
    const randomText = glitchText('ARSLAN MD ULTRA', 0.7);
    const zalgo = zalgoText('SYSTEM HACKED');

    await ctx.send({ text: `> 📺 *GLITCH SCREEN COMPLETE*
> 
> 💢 ${randomText}
> 🌪️ ${zalgo}
> ⚡ System compromised!
> 
> © POWERED BY ARSLAN MD`, edit: msg.key });

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 5. GLITCH MATRIX
// ═══════════════════════════════════════════════════════════════════
export const glitchmatrix = {
  name: 'glitchmatrix',
  aliases: ['gmatrix'],
  async run(ctx) {
    await ctx.react('💻');
    const matrixChars = ['0', '1', '█', '▓', '▒', '░', ' '];
    
    let matrix = '';
    for (let i = 0; i < 8; i++) {
      let line = '';
      for (let j = 0; j < 12; j++) {
        line += random(matrixChars) + ' ';
      }
      matrix += `> ${line}\n`;
    }

    const finalText = `> 💻 *GLITCH MATRIX*
> 
${matrix}
> 🟢 The Matrix has glitched!
> 💢 ${glitchText('Follow the white rabbit', 0.3)}
> 
> © POWERED BY ARSLAN MD`;

    await ctx.reply(finalText);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 6. GLITCH V2
// ═══════════════════════════════════════════════════════════════════
export const glitchv2 = {
  name: 'glitchv2',
  aliases: ['gv2'],
  async run(ctx) {
    const text = ctx.args.join(' ') || 'ARSLAN MD';
    await ctx.react('🌀');

    const finalText = `> 🌀 *ULTRA GLITCH V2*
> 
> 🔮 *Original:* ${text}
> 💢 *Glitched:* ${glitchText(text, 0.8)}
> 🌪️ *Zalgo:* ${zalgoText(text)}
> 🔄 *Reversed:* ${reverseText(text)}
> 🔀 *Random Case:* ${randomCase(text)}
> 🔥 *Mixed:* ${glitchText(text + ' ' + reverseText(text), 0.4)}
> 
> 🎛️ *Glitch Level:* ${Math.floor(Math.random() * 100)}%
> 
> © POWERED BY ARSLAN MD`;

    await ctx.reply(finalText);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 7. GLITCH FLICKER
// ═══════════════════════════════════════════════════════════════════
export const glitchflicker = {
  name: 'glitchflicker',
  aliases: ['gflicker'],
  async run(ctx) {
    await ctx.react('⚡');

    const frames = [
      `> ⚡ *FLICKER*\n> ████░░░░████░░░░\n> ░░░░████░░░░████`,
      `> ⚡ *FLICKER*\n> ░░░░████░░░░████\n> ████░░░░████░░░░`,
      `> ⚡ *FLICKER*\n> ████████████████\n> ░░░░░░░░░░░░░░░░`
    ];

    const msg = await ctx.reply(frames[0]);

    for (let i = 1; i < 6; i++) {
      await sleep(300);
      await ctx.send({ text: frames[i % frames.length], edit: msg.key });
    }

    await sleep(400);
    await ctx.send({ text: `> ⚡ *FLICKER COMPLETE*
> 
> ✅ System restabilized.
> 💢 Glitch ended.
> 
> © POWERED BY ARSLAN MD`, edit: msg.key });

    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 8. GLITCH MIX
// ═══════════════════════════════════════════════════════════════════
export const glitchmix = {
  name: 'glitchmix',
  aliases: ['gmix'],
  async run(ctx) {
    const text = ctx.args.join(' ') || 'ARSLAN TECH';
    await ctx.react('🎛️');

    const finalText = `> 🎛️ *GLITCH MIX*
> 
> 🔄 *Reversed:* ${reverseText(text)}
> 💢 *Glitched:* ${glitchText(text, 0.6)}
> 🌪️ *Zalgo:* ${zalgoText(text)}
> 🔀 *Mixed:* ${glitchText(text + ' ' + reverseText(text), 0.3)}
> 🌀 *Random:* ${glitchText(text, 1.0)}
> 🔤 *Random Case:* ${randomCase(text)}
> 🔥 *All Combined:* ${glitchText(zalgoText(reverseText(text)), 0.5)}
> 
> © POWERED BY ARSLAN MD`;

    await ctx.reply(finalText);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 9. GLITCH RAIN
// ═══════════════════════════════════════════════════════════════════
export const glitchrain = {
  name: 'glitchrain',
  aliases: ['grain'],
  async run(ctx) {
    await ctx.react('🌧️');
    const chars = ['0', '1', '█', '▓', '▒', '░', 'A', 'B', 'C', 'D', 'E', 'F'];
    
    let rain = '';
    for (let i = 0; i < 7; i++) {
      let line = '';
      for (let j = 0; j < 12; j++) {
        line += random(chars) + ' ';
      }
      rain += `> ${line}\n`;
    }

    const finalText = `> 🌧️ *GLITCH RAIN*
> 
${rain}
> 💢 Glitch rain falling...
> 
> © POWERED BY ARSLAN MD`;

    await ctx.reply(finalText);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 10. GLITCH TEXT
// ═══════════════════════════════════════════════════════════════════
export const glitchtext = {
  name: 'glitchtext',
  aliases: ['gtext'],
  async run(ctx) {
    const text = ctx.args.join(' ') || 'ARSLAN';
    await ctx.react('💬');

    const finalText = `> 💬 *GLITCH TEXT*
> 
> > ${glitchText(text, 0.2)} (20%)
> > ${glitchText(text, 0.5)} (50%)
> > ${glitchText(text, 0.8)} (80%)
> > ${zalgoText(text)} (Zalgo)
> 
> © POWERED BY ARSLAN MD`;

    await ctx.reply(finalText);
    await ctx.react('✅');
  }
};

// ═══════════════════════════════════════════════════════════════════
// 11. GLITCH BOMB
// ═══════════════════════════════════════════════════════════════════
export const glitchbomb = {
  name: 'glitchbomb',
  aliases: ['gbomb'],
  async run(ctx) {
    await ctx.react('💥');
    const text = ctx.args.join(' ') || 'BOOM!';

    const finalText = `> 💥 *GLITCH BOMB*
> 
> 💢 ${glitchText(text, 1.0)}
> 🌪️ ${zalgoText(text)}
> 🔄 ${reverseText(text)}
> 🔀 ${randomCase(text)}
> 🔥 ${glitchText(zalgoText(reverseText(text)), 0.6)}
> 
> 💥 Glitch bomb exploded!
> 
> © POWERED BY ARSLAN MD`;

    await ctx.reply(finalText);
    await ctx.react('✅');
  }
};
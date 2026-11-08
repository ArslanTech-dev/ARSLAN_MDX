/**
 * ═══════════════════════════════════════════════════════════════════
 * 📦 UNBLUR.js — ARSLAN MDX Plugin
 * Image unblur / sharpen / HD / enhance / denoise tools (ffmpeg based, no API key)
 * Commands (5): unblur, sharpen, hd, enhance, denoise
 *
 * Use: image bhejo caption mein .unblur likho, ya kisi image ko reply karke .unblur
 * Note: ye sharpening + 2x upscaling hai (offline, koi API key nahi). Halki/medium blur
 *       theek hoti hai; bohot zyada blur AI ki tarah recover nahi hoti.
 * Tip: pehle .unblur, zyada strong chahiye to .enhance
 * ═══════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { downloadContentFromMessage, normalizeMessageContent } from '@whiskeysockets/baileys';
import logger from '../utils/logger.js';

ffmpeg.setFfmpegPath(ffmpegPath.path);

const MAX_INPUT_BYTES = 12 * 1024 * 1024; // 12MB
const FFMPEG_TIMEOUT_MS = 60 * 1000;

// 🎛️ Har mode ka ffmpeg filter chain
const MODES = {
  unblur: {
    label: 'Unblur',
    emoji: '🔍',
    filter: 'scale=iw*2:ih*2:flags=lanczos,hqdn3d=1:1:2:2,unsharp=13:13:3.5:5:5:0.0,unsharp=7:7:2.0:5:5:0.0,unsharp=3:3:1.2:3:3:0.0'
  },
  sharpen: {
    label: 'Sharpen',
    emoji: '🔪',
    filter: 'unsharp=9:9:2.0:5:5:0.0,unsharp=3:3:0.8:3:3:0.0'
  },
  hd: {
    label: 'HD Upscale (2x)',
    emoji: '🖼️',
    filter: 'scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:1.0:5:5:0.0'
  },
  enhance: {
    label: 'Enhance',
    emoji: '✨',
    filter: 'scale=iw*2:ih*2:flags=lanczos,hqdn3d=1:1:2:2,unsharp=13:13:5.0:7:7:0.5,unsharp=7:7:2.5:5:5:0.0,unsharp=3:3:1.5:3:3:0.0,eq=contrast=1.08:saturation=1.15:brightness=0.01'
  },
  denoise: {
    label: 'Denoise',
    emoji: '🧹',
    filter: 'hqdn3d=4:3:6:4.5,unsharp=3:3:0.6:3:3:0.0'
  }
};

const getContextInfo = () => ({
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363412450457588@newsletter',
    newsletterName: 'ARSLAN MDX',
    serverMessageId: 143
  }
});

// 🖼️ Image dhoondo: current message ya reply kiya hua message
function pickImage(content) {
  if (!content) return null;
  const msg = normalizeMessageContent(content) || content;
  if (msg.imageMessage) return msg.imageMessage;
  const doc = msg.documentMessage || msg.documentWithCaptionMessage?.message?.documentMessage;
  if (doc && String(doc.mimetype || '').startsWith('image/')) return doc;
  return null;
}

function findImageNode(ctx) {
  const message = normalizeMessageContent(ctx.msg.message) || ctx.msg.message || {};
  const direct = pickImage(message);
  if (direct) return { node: direct, isDoc: !message.imageMessage };

  const contextInfo = Object.values(message).find((v) => v && typeof v === 'object' && v.contextInfo)?.contextInfo;
  const quoted = contextInfo?.quotedMessage;
  const fromQuoted = pickImage(quoted);
  if (fromQuoted) {
    const q = normalizeMessageContent(quoted) || quoted;
    return { node: fromQuoted, isDoc: !q.imageMessage };
  }
  return null;
}

async function downloadImage(found) {
  const stream = await downloadContentFromMessage(found.node, found.isDoc ? 'document' : 'image');
  const chunks = [];
  let size = 0;
  for await (const chunk of stream) {
    size += chunk.length;
    if (size > MAX_INPUT_BYTES) throw new Error('TOO_BIG');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function runFfmpeg(inputPath, outputPath, filter) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      try { cmd.kill('SIGKILL'); } catch {}
      reject(new Error('FFMPEG_TIMEOUT'));
    }, FFMPEG_TIMEOUT_MS);

    const cmd = ffmpeg(inputPath)
      .videoFilters(filter)
      .outputOptions(['-frames:v', '1', '-q:v', '2'])
      .on('end', () => { clearTimeout(timer); resolve(); })
      .on('error', (err) => { clearTimeout(timer); reject(err); })
      .save(outputPath);
  });
}

async function processImage(buffer, mode) {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const inFile = path.join(os.tmpdir(), `unblur_in_${id}`);
  const outFile = path.join(os.tmpdir(), `unblur_out_${id}.jpg`);
  try {
    fs.writeFileSync(inFile, buffer);
    await runFfmpeg(inFile, outFile, MODES[mode].filter);
    return fs.readFileSync(outFile);
  } finally {
    for (const f of [inFile, outFile]) { try { fs.unlinkSync(f); } catch {} }
  }
}

function createUnblurCommand(name, aliases) {
  const mode = MODES[name];
  return {
    name,
    aliases,
    async run(ctx) {
      const found = findImageNode(ctx);
      if (!found) {
        return ctx.reply(
          `${mode.emoji} *${mode.label}*\n\n` +
          `Image ko reply karke *${ctx.prefix}${name}* likho,\n` +
          `ya image bhejte waqt caption mein *${ctx.prefix}${name}* likho.\n\n` +
          `📌 Modes: ${Object.keys(MODES).map((m) => `${ctx.prefix}${m}`).join(' • ')}`
        );
      }

      await ctx.react('⏳');
      try {
        const input = await downloadImage(found);
        const output = await processImage(input, name);
        await ctx.send({
          image: output,
          caption: `${mode.emoji} *${mode.label}* done!\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀʀsʟᴀɴ-ᴍᴅx`,
          contextInfo: getContextInfo()
        });
        await ctx.react('✅');
      } catch (err) {
        logger.error(`[UNBLUR:${name}] ${err.message}`);
        await ctx.react('❌');
        const msg = err.message === 'TOO_BIG'
          ? '❌ Image bohot badi hai (max 12MB).'
          : err.message === 'FFMPEG_TIMEOUT'
            ? '❌ Process mein bohot time lag gaya, chhoti image try karo.'
            : '❌ Image process nahi ho saki. Dobara try karo.';
        await ctx.reply(msg);
      }
    }
  };
}

export const unblur = createUnblurCommand('unblur', ['deblur', 'clearpic']);
export const sharpen = createUnblurCommand('sharpen', ['sharp']);
export const hd = createUnblurCommand('hd', ['upscale', 'hdr']);
export const enhance = createUnblurCommand('enhance', ['remini', 'enhancepic']);
export const denoise = createUnblurCommand('denoise', ['nr']);

/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚙️ CONFIG.JS — ARSLAN MDX · Enterprise Configuration
 * ═══════════════════════════════════════════════════════════════════
 */

import path from 'path';
import os from 'os'; // 👈 Termux & Cross-platform temp folder detector

export const CONFIG = {
  // ─────────────────────────────────────────────────────────────
  // 🎯 BOT IDENTITY
  // ─────────────────────────────────────────────────────────────
  BOT_NAME: 'ARSLAN MDX',
  BOT_VERSION: '1.0.0-Enterprise',
  OWNER: 'Arslan Tech',

  // ─────────────────────────────────────────────────────────────
  // 🎯 SESSION LIMITS
  // ─────────────────────────────────────────────────────────────
  MAX_SESSIONS: 10,

  // ─────────────────────────────────────────────────────────────
  // ☁️ CROSS-PLATFORM SAFE STORAGE PATHS (TERMUX + CLOUD FIX)
  // os.tmpdir() automatically Termux (/data/data/.../tmp) aur 
  // Cloud Linux (/tmp) dono ke liye sahi path dhoond lega.
  // ─────────────────────────────────────────────────────────────
  DATA_DIR: process.env.DATA_DIR || os.tmpdir(),
  SESSION_DIR: path.join(process.env.DATA_DIR || os.tmpdir(), 'sessions'),
  DB_DIR: path.join(process.env.DATA_DIR || os.tmpdir(), 'database'),

  // ─────────────────────────────────────────────────────────────
  // 🎯 SERVER PORT
  // ─────────────────────────────────────────────────────────────
  PORT: process.env.PORT || 3000,

  // ─────────────────────────────────────────────────────────────
  // 🖼️ WELCOME IMAGE CAPTION
  // ─────────────────────────────────────────────────────────────
  WELCOME_IMAGE_CAPTION:
    `⚡ *ARSLAN MDX* ⚡\n` +
    `> _Advanced Multi-User Core Online_\n\n` +
    `🛡️ _Enterprise-Grade Security Active._`,

  // ─────────────────────────────────────────────────────────────
  // 💼 ADVANCED WELCOME MESSAGE (Text Format)
  // Image ke baad send hone wala text.
  // ─────────────────────────────────────────────────────────────
  WELCOME_MESSAGE: `
╔══════════════════════════════╗
║   ⚡ *A R S L A N   M D X* ⚡   ║
╚══════════════════════════════╝

> _Next-Gen Multi-User Automation_
> _Build: v1.0.0 Enterprise_

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ *CORE DIAGNOSTICS*
┃ ● Engine    : *Baileys v7*
┃ ● Database  : *Cloud-Safe JSON*
┃ ● UI Engine : *Glassmorphism*
┃ ● Status    : *100% Operational*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 *SYSTEM COMMANDS*
┃ ▸ *.menu*    — Load command matrix
┃ ▸ *.ping*    — Measure latency
┃ ▸ *.alive*   — System heartbeat
┃ ▸ *.owner*   — Dev credentials

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 *BROADCAST NETWORK*
_You are now synced with:_
┃ ▸ ARSLAN MDX Command Center

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> *"Engineered to perfection."*
> ─── _Arslan Tech_
`.trim(),

  // ─────────────────────────────────────────────────────────────
  // 📰 CHANNELS — Auto-follow on connect
  // ─────────────────────────────────────────────────────────────
  FOLLOW_CHANNELS: [
    'https://whatsapp.com/channel/0029VbDu9GHB4hdY2mcGCH0u',
    'https://whatsapp.com/channel/0029VbDCycsAYlUGNvDTtK2F',
  ],
};

export default CONFIG;

/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚙️ CONFIG.JS — ARSLAN MDX · Enterprise Configuration
 * ═══════════════════════════════════════════════════════════════════
 */

import path from 'path';
import os from 'os';

// Check if running on cloud (Pxxl/Vercel) or local (Termux)
const isProduction = process.env.NODE_ENV === 'production';

// Base directory for storing data
const baseDataDir = isProduction 
  ? (process.env.DATA_DIR || '/tmp') 
  : path.join(process.cwd(), 'sessions_data'); // 👈 Termux mein permanent save hoga

export const CONFIG = {
  // 🎯 BOT IDENTITY
  BOT_NAME: 'ARSLAN MDX',
  BOT_VERSION: '1.0.0-Enterprise',
  OWNER: 'Arslan Tech',

  // 🎯 SESSION LIMITS
  MAX_SESSIONS: 10,

  // ☁️ CROSS-PLATFORM SAFE STORAGE PATHS
  DATA_DIR: baseDataDir,
  SESSION_DIR: path.join(baseDataDir, 'sessions'),
  DB_DIR: path.join(baseDataDir, 'database'),

  // 🎯 SERVER PORT
  PORT: process.env.PORT || 3000,

  // 🖼️ WELCOME MESSAGE
  WELCOME_IMAGE_CAPTION:
    `⚡ *ARSLAN MDX* ⚡\n` +
    `> _Advanced Multi-User Core Online_\n\n` +
    `🛡️ _Enterprise-Grade Security Active._`,

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

  FOLLOW_CHANNELS: [
    'https://whatsapp.com/channel/0029VbDu9GHB4hdY2mcGCH0u',
    'https://whatsapp.com/channel/0029VbDCycsAYlUGNvDTtK2F',
  ],
};

export default CONFIG;
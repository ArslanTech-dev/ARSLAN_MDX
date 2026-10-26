import path from 'path';
import os from 'os';
import 'dotenv/config'; // 👈 .env load karne ke liye

const isProduction = process.env.NODE_ENV === 'production';
const baseDataDir = isProduction 
  ? (process.env.DATA_DIR || '/tmp') 
  : path.join(process.cwd(), 'sessions_data');

export const CONFIG = {
  // 🎯 BOT IDENTITY
  BOT_NAME: 'ARSLAN MDX',
  BOT_VERSION: '1.0.0-Enterprise',
  OWNER_NUMBER: process.env.OWNER_NUMBER || '923037314690',
  PREFIX: process.env.PREFIX || '.',
  
  // 🎯 SESSION LIMITS
  MAX_SESSIONS: 10,

  // ☁️ STORAGE PATHS
  DATA_DIR: baseDataDir,
  SESSION_DIR: path.join(baseDataDir, 'sessions'),
  DB_DIR: path.join(baseDataDir, 'database'),
  PORT: process.env.PORT || 3000,

  // 🖼️ ASSETS PATHS
  LOGO_PATH: path.join(process.cwd(), 'assets', 'logo.png'),
  WELCOME_IMAGE_PATH: path.join(process.cwd(), 'assets', 'Welcome.png'),

  // 🔑 API KEYS
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY || '',

  // 🖼️ WELCOME MESSAGES
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
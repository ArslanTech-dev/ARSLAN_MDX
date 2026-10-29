import path from 'path';
import os from 'os';
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';
const isAndroid = os.platform() === 'android';

// 🚀 SMART DATA DIR LOGIC
const getDataDir = () => {
  if (process.env.DATA_DIR && process.env.DATA_DIR !== '') return process.env.DATA_DIR;
  if (isAndroid) return path.join(process.cwd(), 'sessions_data'); // Termux safe
  if (isProduction) return '/tmp'; // Cloud safe
  return os.tmpdir(); 
};

const baseDataDir = getDataDir();

export const CONFIG = {
  BOT_NAME: 'ARSLAN MDX',
  BOT_VERSION: '1.0.0-Enterprise',
  OWNER_NUMBER: process.env.OWNER_NUMBER || '923037314690',
  PREFIX: process.env.PREFIX || '.',
  
  MAX_SESSIONS: 10,
  DATA_DIR: baseDataDir,
  SESSION_DIR: path.join(baseDataDir, 'sessions'),
  DB_DIR: path.join(baseDataDir, 'database'),
  PORT: process.env.PORT || 3000,

  // 🖼️ ASSETS
  LOGO_PATH: path.join(process.cwd(), 'assets', 'logo.png'),
  WELCOME_IMAGE_PATH: path.join(process.cwd(), 'assets', 'Welcome.png'),

  // 🔑 API KEYS
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY || '',

  WELCOME_IMAGE_CAPTION: `⚡ *ARSLAN MDX* ⚡\n> _Advanced Multi-User Core Online_\n\n🛡️ _Enterprise-Grade Security Active._`,

  WELCOME_MESSAGE: `
╔══════════════════════════════╗
║   ⚡ *A R S L A N   M D X* ⚡   ║
╚══════════════════════════════╝
> _Next-Gen Multi-User Automation_
> _Build: v1.0.0 Enterprise_
`.trim(),

  FOLLOW_CHANNELS: [
    'https://whatsapp.com/channel/0029VbDu9GHB4hdY2mcGCH0u',
    'https://whatsapp.com/channel/0029VbDCycsAYlUGNvDTtK2F',
  ],
};

export default CONFIG; 
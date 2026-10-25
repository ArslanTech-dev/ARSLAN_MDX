/**
 * ═══════════════════════════════════════════════════════════════════
 * ⭐ INDEX.JS — ARSLAN MDX · Multi-Session Core Engine
 * ═══════════════════════════════════════════════════════════════════
 */

import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestWaWebVersion
} from '@whiskeysockets/baileys';

import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

import { CONFIG } from './config.js';
import { ensureSessionRoot, getSessionPath, deleteSession, listStoredSessions } from './utils/sessionManager.js';
import { setUser, removeUser } from './utils/database.js';
import logger from './utils/logger.js';
import { formatPairingCode } from './pair.js';
import { handleMessage, setupEvents } from './handlers/message.js';

export const activeSessions = new Map();
const pendingPairings = new Map();
const sessionStatus = new Map();

const baileysLogger = pino({ level: 'silent' });
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WELCOME_IMAGE_PATH = path.join(__dirname, 'assets', 'Welcome.png');

// ═══════════════════════════════════════════════════════════════════
// 🎨 ULTRA-ADVANCED TERMINAL BANNER
// ═══════════════════════════════════════════════════════════════════
function displayBanner() {
  const c = {
    cyan: '\x1b[36m', purple: '\x1b[35m', green: '\x1b[32m',
    yellow: '\x1b[33m', red: '\x1b[31m', reset: '\x1b[0m', bold: '\x1b[1m'
  };

  const banner = `
${c.purple}${c.bold}  █████╗ ██████╗ ███████╗██╗      █████╗ ███╗   ██╗${c.reset}
${c.purple}${c.bold} ██╔══██╗██╔══██╗██╔════╝██║     ██╔══██╗████╗  ██║${c.reset}
${c.cyan}${c.bold} ███████║██████╔╝███████╗██║     ███████║██╔██╗ ██║${c.reset}
${c.cyan}${c.bold} ██╔══██║██╔══██╗╚════██║██║     ██╔══██║██║╚██╗██║${c.reset}
${c.green}${c.bold} ██║  ██║██║  ██║███████║███████╗██║  ██║██║ ╚████║${c.reset}
${c.green}${c.bold} ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝${c.reset}
${c.cyan}${c.bold}           ███╗   ███╗██████╗ ██╗  ██╗${c.reset}
${c.cyan}${c.bold}           ████╗ ████║██╔══██╗╚██╗██╔╝${c.reset}
${c.purple}${c.bold}           ██╔████╔██║██║  ██║ ╚███╔╝ ${c.reset}
${c.purple}${c.bold}           ██║╚██╔╝██║██║  ██║ ██╔██╗ ${c.reset}
${c.cyan}${c.bold}           ██║ ╚═╝ ██║██████╔╝██╔╝ ██╗${c.reset}
${c.cyan}${c.bold}           ╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝${c.reset}

${c.yellow} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ${c.reset}
${c.green}  ⚡ ENGINE    :${c.reset} Baileys (Fork)
${c.green}  ⚡ NODE.JS   :${c.reset} ${process.version}
${c.green}  ⚡ PLATFORM  :${c.reset} ${os.platform()} ${os.arch()}
${c.green}  ⚡ MEMORY    :${c.reset} ${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB Total
${c.green}  ⚡ STATUS    :${c.reset} ${c.cyan}ONLINE & OPERATIONAL${c.reset}
${c.yellow} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ${c.reset}
${c.red}  💖 DEDICATION: For Brown Hair Wali (My Everything)${c.reset}
${c.yellow} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ${c.reset}
  `;
  console.log(banner);
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 INIT & AUTO-CONNECT
// ═══════════════════════════════════════════════════════════════════
export async function initSessionManager() {
  displayBanner();
  await ensureSessionRoot();
  logger.success(`💖 ARSLAN MDX Engine Initialized`);

  const storedSessions = await listStoredSessions();
  if (storedSessions.length > 0) {
    logger.info(`🔄 Found ${storedSessions.length} saved session(s). Auto-reconnecting...`);
    
    for (const number of storedSessions) {
      startBotForUser(number, false).catch((err) => {
        logger.error(`Auto-reconnect failed for ${number}:`, err.message);
      });
    }
  } else {
    logger.info(`⏳ No saved sessions found. Waiting for new connection...`);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📰 CHANNEL AUTO-FOLLOW
// ═══════════════════════════════════════════════════════════════════
async function followChannel(sock, url) {
  try {
    const code = String(url).match(/\/channel\/([A-Za-z0-9]+)/)?.[1];
    if (!code) return false;
    const meta = await sock.newsletterMetadata('invite', code);
    if (!meta?.id) return false;
    await sock.newsletterFollow(meta.id);
    logger.success(`✅ Channel Followed: ${meta.name || meta.id}`);
    return true;
  } catch (err) {
    logger.warn(`Channel follow failed: ${err.message}`);
    return false;
  }
}

async function followAllChannels(sock) {
  for (const url of CONFIG.FOLLOW_CHANNELS) {
    await followChannel(sock, url);
    await new Promise((r) => setTimeout(r, 1500));
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🖼️ WELCOME MESSAGE
// ═══════════════════════════════════════════════════════════════════
async function sendWelcomeMessage(sock, number) {
  const selfJid = `${number}@s.whatsapp.net`;
  try {
    if (await fs.pathExists(WELCOME_IMAGE_PATH)) {
      try {
        await sock.sendMessage(selfJid, {
          image: fs.readFileSync(WELCOME_IMAGE_PATH),
          caption: CONFIG.WELCOME_IMAGE_CAPTION,
          mimetype: 'image/png',
        });
        logger.success(`🖼️ Welcome Image Sent to: ${number}`);
        await new Promise((r) => setTimeout(r, 1000));
      } catch (imgErr) {
        logger.error(`Image send failed (${number}):`, imgErr.message);
      }
    } else {
      logger.warn(`⚠️ Image not found at: ${WELCOME_IMAGE_PATH}`);
    }
    await sock.sendMessage(selfJid, { text: CONFIG.WELCOME_MESSAGE });
    logger.success(`📩 Welcome Text Sent to: ${number}`);
  } catch (err) {
    logger.error(`Welcome message failed (${number}):`, err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🤖 CORE — START BOT FOR USER
// ═══════════════════════════════════════════════════════════════════
export async function startBotForUser(number, isNew = false) {
  if (activeSessions.has(number)) return activeSessions.get(number);
  if (activeSessions.size >= CONFIG.MAX_SESSIONS) {
    throw new Error(`Max ${CONFIG.MAX_SESSIONS} sessions reached.`);
  }

  const { state, saveCreds } = await useMultiFileAuthState(getSessionPath(number));
  const { version } = await fetchLatestWaWebVersion();
  
  const sock = makeWASocket({
    version,
    logger: baileysLogger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, baileysLogger),
    },
    browser: ['Mac OS', 'Chrome', '14.4.1'], 
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: false,
    syncFullHistory: false,
    connectTimeoutMs: 60_000,
    defaultQueryTimeoutMs: 60_000,
  });

  activeSessions.set(number, sock);
  sessionStatus.set(number, { status: 'connecting', since: Date.now() });

  sock.ev.on('creds.update', saveCreds);
  setupEvents(sock, number);

  let hasOpenedOnce = false;

  // 📩 MESSAGE RECEIVER (UPDATED FOR OWNER COMMANDS)
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message) continue; // Sirf empty messages ignore karega, fromMe NAHI.
      
      const from = msg.key.remoteJid;
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      
      // Debug Log (Sirf incoming messages ke liye, spam se bachne ke liye)
      if (text && !msg.key.fromMe) {
        logger.info(`📩 Incoming message from ${from}: "${text}"`);
      }
      
      try {
        await handleMessage(sock, msg, number); // Ab fromMe messages bhi handleMessage tak jayenge
      } catch (err) {
        logger.error(`Handler error (${number}):`, err.message);
      }
    }
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && pendingPairings.has(number) && !sock.authState.creds.registered) {
      const pending = pendingPairings.get(number);
      try {
        await new Promise(r => setTimeout(r, 2000));
        const raw = await sock.requestPairingCode(number);
        const code = formatPairingCode(raw);
        logger.success(`🔐 Pairing Code (${number}): ${code}`);
        pending.resolve(code);
      } catch (err) {
        logger.error('Pairing code generation failed:', err.message);
        pending.reject(new Error('Failed to generate pairing code.'));
      } finally {
        pendingPairings.delete(number);
      }
    }

    if (connection === 'open') {
      hasOpenedOnce = true;
      logger.success(`✅ Session OPEN: ${number}`);
      sessionStatus.set(number, { status: 'connected', since: Date.now() });
      await setUser(number, { number, jid: sock.user?.id, name: sock.user?.name || '', status: 'connected' });
      
      if (isNew) {
        logger.info(`📩 Sending Welcome Message to new pairing: ${number}`);
        await new Promise(r => setTimeout(r, 2000));
        await sendWelcomeMessage(sock, number);
        isNew = false;
      }
      
      await followAllChannels(sock);
    }

    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      
      activeSessions.delete(number);
      sessionStatus.delete(number);

      if (code === 515) {
        logger.info(`🔄 Pairing accepted for ${number}. Reconnecting...`);
        setTimeout(() => { startBotForUser(number, false).catch((e) => logger.error(`Reconnect failed (${number}):`, e.message)); }, 3000);
        return;
      }

      if (code === 405) {
        logger.warn(`⚠️ 405 Method Not Allowed for ${number}. Retrying...`);
        setTimeout(() => { startBotForUser(number, false).catch((e) => logger.error(`Retry failed (${number}):`, e.message)); }, 5000);
        return;
      }

      if (!hasOpenedOnce) {
        await deleteSession(number);
        const pending = pendingPairings.get(number);
        if (pending) {
          pending.reject(new Error('Pairing failed. Generate a new code.'));
          pendingPairings.delete(number);
        }
        logger.warn(`[Pairing] ${number} never opened (code ${code}) — session purged`);
        return;
      }

      if (code === DisconnectReason.loggedOut) {
        await deleteSession(number);
        await removeUser(number);
        logger.warn(`🗑️ Logged out & purged: ${number}`);
      } else {
        logger.info(`🔄 Reconnecting ${number} in 3s...`);
        setTimeout(() => { startBotForUser(number, false).catch((e) => logger.error(`Reconnect failed (${number}):`, e.message)); }, 3000);
      }
    }
  });

  return sock;
}

export async function createPairingCode(number) {
  if (!activeSessions.has(number)) await deleteSession(number);
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { pendingPairings.delete(number); reject(new Error('Pairing timeout.')); }, 30000);
    pendingPairings.set(number, {
      resolve: (c) => { clearTimeout(timeout); resolve(c); },
      reject: (e) => { clearTimeout(timeout); reject(e); },
    });
    startBotForUser(number, true).catch((err) => { clearTimeout(timeout); pendingPairings.delete(number); reject(err); });
  });
}

export async function unpairUser(number) {
  const sock = activeSessions.get(number);
  try {
    if (sock) {
      await sock.logout().catch(() => {});
      activeSessions.delete(number);
      sessionStatus.delete(number);
    }
    await deleteSession(number);
    await removeUser(number);
    logger.warn(`🗑️ Unpaired: ${number}`);
    return true;
  } catch (err) {
    logger.error(`Unpair failed (${number}):`, err.message);
    return false;
  }
}

export function getSessionList() {
  const out = [];
  for (const [number, sock] of activeSessions.entries()) {
    const meta = sessionStatus.get(number) || { status: 'unknown' };
    out.push({ number, name: sock.user?.name || '', status: meta.status, since: meta.since });
  }
  return out;
}
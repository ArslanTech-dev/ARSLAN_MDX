/**
 * ═══════════════════════════════════════════════════════════════════
 * ⭐ INDEX.JS — ARSLAN MDX · Ultra Strong Pairing Engine
 * ═══════════════════════════════════════════════════════════════════
 */

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestWaWebVersion,
  Browsers // 👈 Import Browsers
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ═══════════════════════════════════════════════════════════════════
// 🎨 MILITARY-GRADE BANNER
// ═══════════════════════════════════════════════════════════════════
function displayBanner() {
  const c = {
    cyan: '\x1b[36m', purple: '\x1b[35m', green: '\x1b[32m',
    yellow: '\x1b[33m', red: '\x1b[31m', reset: '\x1b[0m', bold: '\x1b[1m'
  };
  const TL = '╔', TR = '╗', BL = '╚', BR = '╝', H = '═', V = '║', ML = '╠', MR = '╣';

  const banner = `
${c.cyan}${TL}${H.repeat(68)}${TR}${c.reset}
${c.cyan}${V}${c.reset}  ${c.purple}${c.bold}  █████╗ ██████╗ ███████╗██╗      █████╗ ███╗   ██╗ ${c.reset}  ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset}  ${c.purple}${c.bold} ██╔══██╗██╔══██╗██╔════╝██║     ██╔══██╗████╗  ██║ ${c.reset}  ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset}  ${c.cyan}${c.bold} ███████║██████╔╝███████╗██║     ███████║██╔██╗ ██║ ${c.reset}  ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset}  ${c.cyan}${c.bold} ██╔══██║██╔══██╗╚════██║██║     ██╔══██║██║╚██╗██║ ${c.reset}  ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset}  ${c.green}${c.bold} ██║  ██║██║  ██║███████║███████╗██║  ██║██║ ╚████║ ${c.reset}  ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset}  ${c.green}${c.bold} ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ${c.reset}  ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset}  ${c.cyan}${c.bold}            ███╗   ███╗██████╗ ██╗  ██╗               ${c.reset}  ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset}  ${c.cyan}${c.bold}            ████╗ ████║██╔══██╗╚██╗██╔╝               ${c.reset}  ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset}  ${c.purple}${c.bold}            ██╔████╔██║██║  ██║ ╚███╔╝                ${c.reset}  ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset}  ${c.purple}${c.bold}            ██║╚██╔╝██║██║  ██║ ██╔██╗                ${c.reset}  ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset}  ${c.cyan}${c.bold}            ██║ ╚═╝ ██║██████╔╝██╔╝ ██╗               ${c.reset}  ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset}  ${c.cyan}${c.bold}            ╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝               ${c.reset}  ${c.cyan}${V}${c.reset}
${c.cyan}${ML}${H.repeat(68)}${MR}${c.reset}
${c.cyan}${V}${c.reset} ${c.yellow}⚡ CORE SYSTEM DIAGNOSTICS${c.reset}                                         ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset} ${c.green}● ENGINE    :${c.reset} @whiskeysockets/baileys v7 (Official)            ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset} ${c.green}● NODE.JS   :${c.reset} ${process.version.padEnd(43)} ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset} ${c.green}● PLATFORM  :${c.reset} ${(os.platform() + ' ' + os.arch()).padEnd(43)} ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset} ${c.green}● MEMORY    :${c.reset} ${String(Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB Total').padEnd(43)} ${c.cyan}${V}${c.reset}
${c.cyan}${V}${c.reset} ${c.green}● STATUS    :${c.reset} ${c.cyan}ONLINE & OPERATIONAL${c.reset}                            ${c.cyan}${V}${c.reset}
${c.cyan}${ML}${H.repeat(68)}${MR}${c.reset}
${c.cyan}${V}${c.reset} ${c.red}💖 DEDICATION: For Brown Hair Wali (My Everything)${c.reset}              ${c.cyan}${V}${c.reset}
${c.cyan}${BL}${H.repeat(68)}${BR}${c.reset}
  `;
  console.log(banner);
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 BOOT SEQUENCE & AUTO-CONNECT
// ═══════════════════════════════════════════════════════════════════
export async function initSessionManager() {
  displayBanner();
  logger.info(`[BOOT] Starting ARSLAN MDX Core...`);
  await sleep(300);
  await ensureSessionRoot();
  logger.success(`[BOOT] Storage mounted.`);
  await sleep(300);

  const storedSessions = await listStoredSessions();
  if (storedSessions.length > 0) {
    logger.info(`🔄 Found ${storedSessions.length} saved session(s). Auto-reconnecting...`);
    for (const number of storedSessions) {
      startBotForUser(number, false).catch((err) => {
        logger.error(`[Auto-Connect] Failed for ${number}:`, err.message);
      });
    }
  } else {
    logger.warn(`⏳ No saved sessions. Waiting for new connection...`);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📰 CHANNEL FOLLOW & WELCOME
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
    await sleep(1500);
  }
}

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
        await sleep(1000);
      } catch (imgErr) {
        logger.error(`Image send failed (${number}):`, imgErr.message);
      }
    }
    await sock.sendMessage(selfJid, { text: CONFIG.WELCOME_MESSAGE });
    logger.success(`📩 Welcome Text Sent to: ${number}`);
  } catch (err) {
    logger.error(`Welcome message failed (${number}):`, err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🤖 CORE — START BOT (ULTRA STRONG PAIRING)
// ═══════════════════════════════════════════════════════════════════
export async function startBotForUser(number, isNew = false) {
  if (activeSessions.has(number)) return activeSessions.get(number);
  if (activeSessions.size >= CONFIG.MAX_SESSIONS) throw new Error(`Max sessions reached.`);

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
    // 🚀 SAFARI MACOS FIX
    browser: Browsers.macOS('Safari'), 
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
  let pairingRequested = false;
  let pairingReady = false;

  // 🚀 PAIR-DEVICE EVENT
  sock.ev.on('pair-device', () => {
    logger.info(`[Pairing] Server is ready for pairing code.`);
    pairingReady = true;
  });

  // 📩 MESSAGE RECEIVER
  sock.ev.on('messages.upsert', async (m) => {
    for (const msg of m.messages) {
      if (!msg.message) continue; 
      
      const from = msg.key.remoteJid;
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      
      if (text && !msg.key.fromMe) {
        logger.info(`[EVENT] Type: ${m.type} | fromMe: ${msg.key.fromMe} | text: "${text}"`);
      }
      
      try {
        await handleMessage(sock, msg, number);
      } catch (err) {
        logger.error(`Handler error (${number}):`, err.message);
      }
    }
  });

  // 🔄 CONNECTION UPDATES
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // 🚀 PAIRING CODE GENERATION
    if (qr && pendingPairings.has(number) && !sock.authState.creds.registered && !pairingRequested) {
      pairingRequested = true;
      const pending = pendingPairings.get(number);
      
      try {
        if (!pairingReady) {
          logger.info(`[Pairing] Waiting for server readiness...`);
          await sleep(3000);
        }
        
        const raw = await sock.requestPairingCode(number);
        const code = formatPairingCode(raw);
        
        logger.success(`\n🔐 [PAIRING] Code: ${code}\n`);
        pending.resolve(code);
      } catch (err) {
        logger.error('[Pairing] Code generation failed:', err.message);
        pending.reject(new Error('Failed to generate pairing code.'));
      } finally {
        pendingPairings.delete(number);
        pairingRequested = false;
      }
    }

    // ✅ CONNECTED
    if (connection === 'open') {
      hasOpenedOnce = true;
      logger.success(`\n✅ [SESSION OPEN] ${number} is now connected!\n`);
      sessionStatus.set(number, { status: 'connected', since: Date.now() });
      await setUser(number, { number, jid: sock.user?.id, name: sock.user?.name || '', status: 'connected' });
      
      if (isNew) {
        await sleep(2000);
        await sendWelcomeMessage(sock, number);
        isNew = false;
      }
      await followAllChannels(sock);
    }

    // ❌ DISCONNECTED
    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      activeSessions.delete(number);
      sessionStatus.delete(number);

      if (code === 405) {
        logger.error(`⚠️ [405] Method Not Allowed for ${number}. Aborting.`);
        await deleteSession(number);
        return;
      }

      if (code === DisconnectReason.loggedOut) {
        await deleteSession(number);
        await removeUser(number);
        logger.warn(`🗑️ [401] Logged out & purged: ${number}`);
        return;
      }

      if (code === 515) {
        logger.info(`🔄 [515] Pairing accepted. Reconnecting...`);
        setTimeout(() => { startBotForUser(number, false).catch(() => {}); }, 3000);
        return;
      }

      if (!hasOpenedOnce) {
        await deleteSession(number);
        const pending = pendingPairings.get(number);
        if (pending) {
          pending.reject(new Error('Pairing failed. Generate a new code.'));
          pendingPairings.delete(number);
        }
        logger.warn(`[Pairing] ${number} never opened (code ${code}).`);
        return;
      }

      logger.info(`🔄 Reconnecting ${number} in 3s...`);
      setTimeout(() => { startBotForUser(number, false).catch(() => {}); }, 3000);
    }
  });

  return sock;
}

// ═══════════════════════════════════════════════════════════════════
// 🔐 CREATE PAIRING CODE
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 🗑️ UNPAIR (Ab yeh maujood hai)
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// 📊 GET SESSION LIST (Ab yeh bhi maujood hai)
// ═══════════════════════════════════════════════════════════════════
export function getSessionList() {
  const out = [];
  for (const [number, sock] of activeSessions.entries()) {
    const meta = sessionStatus.get(number) || { status: 'unknown' };
    out.push({ number, name: sock.user?.name || '', status: meta.status, since: meta.since });
  }
  return out;
}
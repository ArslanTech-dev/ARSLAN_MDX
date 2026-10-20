/**
 * ═══════════════════════════════════════════════════════════════════
 * ⭐ INDEX.JS — ARSLAN MDX · Multi-Session Core Engine
 * ═══════════════════════════════════════════════════════════════════
 * Powered by ms-nicky-baileys.
 * Features: Auto 515 reconnect, native canonical browser labels.
 */

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestWaWebVersion,
} from '@whiskeysockets/baileys';

import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

import { CONFIG } from './config.js';
import { ensureSessionRoot, getSessionPath, deleteSession } from './utils/sessionManager.js';
import { setUser, removeUser } from './utils/database.js';
import logger from './utils/logger.js';
import { formatPairingCode } from './pair.js';
import { handleMessage, setupEvents } from './handlers/message.js';

// ═══════════════════════════════════════════════════════════════════
// 🗺️ GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════
export const activeSessions = new Map();
const pendingPairings = new Map();
const sessionStatus = new Map();

const baileysLogger = pino({ level: 'silent' });
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WELCOME_IMAGE_PATH = path.join(__dirname, 'assets', 'welcome.png');

// ═══════════════════════════════════════════════════════════════════
// 🚀 INIT
// ═══════════════════════════════════════════════════════════════════
export async function initSessionManager() {
  await ensureSessionRoot();
  logger.success(`💖 ARSLAN MDX Engine Initialized`);
}

// ═══════════════════════════════════════════════════════════════════
// 📰 CHANNEL AUTO-FOLLOW
// ═══════════════════════════════════════════════════════════════════
function extractInviteCode(url) {
  const m = String(url).match(/\/channel\/([A-Za-z0-9]+)/);
  return m ? m[1] : null;
}

async function followChannel(sock, url) {
  const code = extractInviteCode(url);
  if (!code) return false;

  try {
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
      await sock.sendMessage(selfJid, {
        image: fs.readFileSync(WELCOME_IMAGE_PATH),
        caption: CONFIG.WELCOME_IMAGE_CAPTION,
        mimetype: 'image/png',
      });
      await new Promise((r) => setTimeout(r, 800));
    }
    await sock.sendMessage(selfJid, { text: CONFIG.WELCOME_MESSAGE });
    logger.success(`📩 Welcome Pack Sent to: ${number}`);
  } catch (err) {
    logger.error(`Welcome message failed (${number}):`, err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🤖 CORE — START BOT FOR USER
// ═══════════════════════════════════════════════════════════════════
export async function startBotForUser(number) {
  if (activeSessions.has(number)) return activeSessions.get(number);
  if (activeSessions.size >= CONFIG.MAX_SESSIONS) {
    throw new Error(`Max ${CONFIG.MAX_SESSIONS} sessions reached.`);
  }

  const { state, saveCreds } = await useMultiFileAuthState(getSessionPath(number));
  const { version, isLatest } = await fetchLatestWaWebVersion({});
  logger.info(`[Baileys] Using WA v${version.join('.')}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    logger: baileysLogger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, baileysLogger),
    },
    // 🚀 Nicky's baileys handles canonical browser labels automatically.
    browser: ['ARSLAN MDX', 'Chrome', '1.0.0'], 
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

  let hasOpenedOnce = false; // 🚀 Prevent reconnect loop if pairing fails

  // 📩 Message Router
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;
      try {
        await handleMessage(sock, msg, number);
      } catch (err) {
        logger.error(`Handler error (${number}):`, err.message);
      }
    }
  });

  // 🔄 Connection Updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // 1. Pairing code logic
    if (qr && pendingPairings.has(number) && !sock.authState.creds.registered) {
      const pending = pendingPairings.get(number);
      try {
        // Nicky's baileys sometimes needs a tiny delay for socket stabilization
        await new Promise(r => setTimeout(r, 1000)); 
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

    // 2. Connected
    if (connection === 'open') {
      hasOpenedOnce = true;
      logger.success(`✅ Session OPEN: ${number}`);
      sessionStatus.set(number, { status: 'connected', since: Date.now() });
      
      await setUser(number, { number, jid: sock.user?.id, name: sock.user?.name || '', status: 'connected' });
      
      await sendWelcomeMessage(sock, number);
      await followAllChannels(sock);
    }

    // 3. Disconnected
    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      
      activeSessions.delete(number);
      sessionStatus.delete(number);

      // 🚀 CRITICAL FIX: If it never opened (pairing failed), don't loop
      if (!hasOpenedOnce) {
        await deleteSession(number);
        const pending = pendingPairings.get(number);
        if (pending) {
          pending.reject(new Error('Pairing fail — code expire ho gaya ya WhatsApp ne reject kiya.'));
          pendingPairings.delete(number);
        }
        logger.warn(`[Pairing] ${number} never opened (code ${code}) — session purged, NO reconnect`);
        return;
      }

      // Normal Reconnect / Logout Logic
      if (code === DisconnectReason.loggedOut) {
        await deleteSession(number);
        await removeUser(number);
        logger.warn(`🗑️ Logged out & purged: ${number}`);
      } else {
        logger.info(`🔄 Reconnecting ${number} in 3s...`);
        setTimeout(() => {
          startBotForUser(number).catch((e) => logger.error(`Reconnect failed (${number}):`, e.message));
        }, 3000);
      }
    }
  });

  return sock;
}

// ═══════════════════════════════════════════════════════════════════
// 🔐 CREATE PAIRING CODE
// ═══════════════════════════════════════════════════════════════════
export async function createPairingCode(number) {
  // Fresh start: agar active nahi hai to purana half-baked session delete karo
  if (!activeSessions.has(number)) {
    await deleteSession(number);
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingPairings.delete(number);
      reject(new Error('Pairing timeout — QR event nahi mila.'));
    }, 25000);

    pendingPairings.set(number, {
      resolve: (c) => { clearTimeout(timeout); resolve(c); },
      reject: (e) => { clearTimeout(timeout); reject(e); },
    });

    startBotForUser(number).catch((err) => {
      clearTimeout(timeout);
      pendingPairings.delete(number);
      reject(err);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// 🗑️ UNPAIR
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
// 📊 GET SESSION LIST
// ═══════════════════════════════════════════════════════════════════
export function getSessionList() {
  const out = [];
  for (const [number, sock] of activeSessions.entries()) {
    const meta = sessionStatus.get(number) || { status: 'unknown' };
    out.push({ number, name: sock.user?.name || '', status: meta.status, since: meta.since });
  }
  return out;
}
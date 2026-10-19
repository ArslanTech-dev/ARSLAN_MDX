/**
 * ═══════════════════════════════════════════════════════════════════
 * ⭐ INDEX.JS — ARSLAN MDX · Multi-Session Core Engine
 * ═══════════════════════════════════════════════════════════════════
 * The heart of the bot. Handles multi-user sockets, pairing flows,
 * and advanced event interceptors (Anti-Delete & Anti-Call).
 */

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

import { CONFIG } from './config.js';
import { ensureSessionRoot, getSessionPath, deleteSession } from './utils/sessionManager.js';
import { setUser, removeUser, readDb } from './utils/database.js';
import logger from './utils/logger.js';
import { formatPairingCode } from './pair.js';

// ═══════════════════════════════════════════════════════════════════
// 🗺️ GLOBAL STATE (In-Memory Maps)
// ═══════════════════════════════════════════════════════════════════
export const activeSessions = new Map();       // number -> sock
const pendingPairings = new Map();             // number -> { resolve, reject }
const sessionStatus = new Map();               // number -> { status, since }
const messageCache = new Map();                // msgId -> message object (Anti-Delete)

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
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: baileysLogger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, baileysLogger),
    },
    browser: ['ARSLAN MDX', 'Chrome', '1.0.0'],
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: false,
  });

  activeSessions.set(number, sock);
  sessionStatus.set(number, { status: 'connecting', since: Date.now() });

  sock.ev.on('creds.update', saveCreds);

  // ─────────────────────────────────────────────────────────────
  // 🛡️ EVENT INTERCEPTOR 1: ANTI-DELETE (Message Recovery)
  // ─────────────────────────────────────────────────────────────
  sock.ev.on('messages.update', async (updates) => {
    const db = await readDb();
    if (!db.global_settings?.antiDelete) return; // Check if feature is ON

    for (const update of updates) {
      // Check if the update is a deletion (REVOKE)
      if (update.update.messageStubType === 1 || update.update.message?.protocolMessage?.type === 0) {
        const msgId = update.key.id;
        const cachedMsg = messageCache.get(msgId);
        
        if (cachedMsg) {
          try {
            const from = update.key.remoteJid;
            const sender = update.key.participant || update.key.remoteJid;
            
            let text = "🚨 *Anti-Delete Triggered!*\n\n";
            text += `👤 *Sender:* @${sender.split('@')[0]}\n`;
            text += `🗑️ *Action:* Message was deleted.\n\n`;
            text += `📝 *Recovered Message:* \n`;

            await sock.sendMessage(from, { text: text, mentions: [sender] });

            // Resend the original content (text or media)
            if (cachedMsg.message.conversation || cachedMsg.message.extendedTextMessage) {
              await sock.sendMessage(from, { text: cachedMsg.message.conversation || cachedMsg.message.extendedTextMessage.text });
            } else {
              // For media, we just forward the raw message object
              await sock.sendMessage(from, { forward: cachedMsg });
            }
            
            messageCache.delete(msgId); // Clean up cache after recovery
          } catch (e) {
            logger.error('Anti-Delete error:', e.message);
          }
        }
      }
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 🛡️ EVENT INTERCEPTOR 2: ANTI-CALL (Call Rejector)
  // ─────────────────────────────────────────────────────────────
  sock.ev.on('call', async (calls) => {
    const db = await readDb();
    if (!db.global_settings?.antiCall) return;

    for (const call of calls) {
      if (call.status === 'offer') {
        try {
          // Reject the call
          await sock.rejectCall(call.id, call.from);
          
          // Send warning to the caller
          await sock.sendMessage(call.from, { 
            text: `📵 *ARSLAN MDX Security*\n\nSorry, calls are automatically rejected to prevent spam and maintain privacy. Please send a text message instead.` 
          });
          logger.warn(`📵 Anti-Call: Rejected call from ${call.from}`);
        } catch (err) {
          logger.error('Anti-Call reject failed:', err.message);
        }
      }
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 📩 MESSAGE ROUTER & CACHE POPULATOR
  // ─────────────────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message) continue;
      
      // 1. Cache the message for Anti-Delete (only cache non-status messages)
      if (msg.key.remoteJid !== 'status@broadcast' && !msg.key.fromMe) {
        messageCache.set(msg.key.id, msg);
        // Keep cache size manageable (e.g., max 500 messages)
        if (messageCache.size > 500) {
          const firstKey = messageCache.keys().next().value;
          messageCache.delete(firstKey);
        }
      }

      // 2. Route to Commands Handler
      if (!msg.key.fromMe) {
        try {
          const { handleMessage } = await import('./handlers/message.js');
          await handleMessage(sock, msg, number);
        } catch (err) {
          logger.error(`Handler error (${number}):`, err.message);
        }
      }
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 🔄 CONNECTION UPDATES & PAIRING FIX
  // ─────────────────────────────────────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // ⭐ CRITICAL FIX: Generate Pairing Code ONLY after QR event
    if (qr && pendingPairings.has(number)) {
      const pending = pendingPairings.get(number);
      try {
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
      logger.success(`✅ Session OPEN: ${number}`);
      sessionStatus.set(number, { status: 'connected', since: Date.now() });
      
      await setUser(number, { number, jid: sock.user?.id, name: sock.user?.name || '', status: 'connected' });
      
      // Send Welcome & Follow Channels
      await sendWelcomeMessage(sock, number);
      await followAllChannels(sock);
    }

    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut;
      logger.warn(`❌ Session CLOSED: ${number} (Code: ${code})`);

      activeSessions.delete(number);
      sessionStatus.delete(number);

      if (loggedOut) {
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
export function createPairingCode(number) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingPairings.delete(number);
      reject(new Error('Pairing timeout — QR event not received in 15s.'));
    }, 15000);

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
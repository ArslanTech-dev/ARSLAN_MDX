/**
 * ═══════════════════════════════════════════════════════════════════
 * 🚫 ANTISPAMENGINE.JS — Incoming Command Rate Limiter
 * ═══════════════════════════════════════════════════════════════════
 * Prevents users from spamming commands.
 */

import { readDb } from './database.js';

const spamMap = new Map();
const MAX_COMMANDS = 5;      // Max 5 commands allowed
const TIME_WINDOW_MS = 10000; // In 10 seconds

export async function isSpamming(senderJid) {
  try {
    const db = await readDb();
    // If antispam is turned off in db, allow immediately
    if (db.global_settings?.antiSpam === false) return { spam: false };

    const now = Date.now();
    if (!spamMap.has(senderJid)) spamMap.set(senderJid, []);

    let timestamps = spamMap.get(senderJid);
    timestamps = timestamps.filter(ts => now - ts < TIME_WINDOW_MS);

    if (timestamps.length >= MAX_COMMANDS) {
      const remaining = Math.ceil((TIME_WINDOW_MS - (now - timestamps[0])) / 1000);
      return { spam: true, remaining };
    }

    timestamps.push(now);
    spamMap.set(senderJid, timestamps);
    
    return { spam: false };
  } catch (err) {
    return { spam: false };
  }
}
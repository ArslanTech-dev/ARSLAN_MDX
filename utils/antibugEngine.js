/**
 * ═══════════════════════════════════════════════════════════════════
 * 🐞 ANTIBUGENGINE.JS — Incoming Message Payload Checker
 * ═══════════════════════════════════════════════════════════════════
 * Blocks malicious text payloads that could crash the bot.
 */

import logger from './logger.js';

const MAX_TEXT_LENGTH = 5000; // Max 5,000 characters
const MAX_EMOJIS = 150; // Max 150 emojis

// Unicode control characters & invisible marks
const SUSPICIOUS_PATTERNS = [
  /[\u200B-\u200F\u202A-\u202E]/g, // Invisible / RTL overwrite characters
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, // Control chars
  /(\u200e|\u200f){10,}/g // Excessive RTL/LTR marks
];

export function isPayloadBugged(text) {
  if (!text) return false;

  // 1. Check Text Length
  if (text.length > MAX_TEXT_LENGTH) {
    logger.warn(`[ANTI-BUG] Blocked huge text payload (${text.length} chars)`);
    return true;
  }

  // 2. Check Emoji Flooding (Emoji count > MAX_EMOJIS)
  const emojiCount = (text.match(/\p{Extended_Pictographic}/gu) || []).length;
  if (emojiCount > MAX_EMOJIS) {
    logger.warn(`[ANTI-BUG] Blocked emoji flood (${emojiCount} emojis)`);
    return true;
  }

  // 3. Check Suspicious Patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      logger.warn(`[ANTI-BUG] Blocked suspicious unicode pattern`);
      return true;
    }
  }

  // 4. Check for massive repetition (e.g., "aaaaaaaa")
  if (/(.)\1{50,}/.test(text)) {
    logger.warn(`[ANTI-BUG] Blocked character repetition flood`);
    return true;
  }

  return false;
}
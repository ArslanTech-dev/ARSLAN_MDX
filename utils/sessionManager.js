/**
 * ═══════════════════════════════════════════════════════════════════
 * 📂 SESSION-MANAGER.JS — Cloud-Safe Storage Lifecycle
 * ═══════════════════════════════════════════════════════════════════
 * Handles creation and deletion of Baileys auth state folders.
 * Guarantees that the bot runs on non-root cloud environments
 * by utilizing the /tmp directory.
 */

import fs from 'fs-extra';
import path from 'path';
import { CONFIG } from '../config.js';
import logger from './logger.js';

const SESSION_ROOT = CONFIG.SESSION_DIR;

/**
 * Startup pe ensure karta hai ke /tmp/sessions directory majood ho.
 * Agar nahi hai, toh recursively create karta hai.
 */
export async function ensureSessionRoot() {
  try {
    await fs.ensureDir(SESSION_ROOT);
    logger.success(`Session storage mounted at: ${SESSION_ROOT}`);
  } catch (err) {
    logger.error('Failed to mount session root:', err.message);
    process.exit(1); // Agar /tmp bhi na chale, toh bot chalane ka faida nahi
  }
}

/**
 * Har user ke liye specific folder path return karta hai.
 */
export function getSessionPath(number) {
  return path.join(SESSION_ROOT, sanitizeNumber(number));
}

/**
 * Unpair karne pe folder completely delete karta hai.
 */
export async function deleteSession(number) {
  try {
    await fs.remove(getSessionPath(number));
    logger.warn(`Session data purged for: ${number}`);
    return true;
  } catch (err) {
    logger.error(`Failed to purge session (${number}):`, err.message);
    return false;
  }
}

/**
 * Number ko sanitize karta hai (sirf digits allowed).
 * Throws error if the phone number is clearly invalid.
 */
export function sanitizeNumber(number) {
  const cleaned = String(number).replace(/\D/g, '');
  if (cleaned.length < 7 || cleaned.length > 15) {
    throw new Error('Invalid phone number length detected.');
  }
  return cleaned;
}
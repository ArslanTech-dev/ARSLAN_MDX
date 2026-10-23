/**
 * ═══════════════════════════════════════════════════════════════════
 * 📂 SESSION-MANAGER.JS — Cloud-Safe Storage Lifecycle
 * ═══════════════════════════════════════════════════════════════════
 */

import fs from 'fs-extra';
import path from 'path';
import { CONFIG } from '../config.js';
import logger from './logger.js';

const SESSION_ROOT = CONFIG.SESSION_DIR;

export async function ensureSessionRoot() {
  try {
    await fs.ensureDir(SESSION_ROOT);
    logger.success(`Session storage mounted at: ${SESSION_ROOT}`);
  } catch (err) {
    logger.error('Failed to mount session root:', err.message);
    process.exit(1);
  }
}

export function getSessionPath(number) {
  return path.join(SESSION_ROOT, sanitizeNumber(number));
}

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

// 🚀 NEW: Purane sessions list karne ke liye (Auto-Connect ke liye zaroori)
export async function listStoredSessions() {
  try {
    await ensureSessionRoot();
    const entries = await fs.readdir(SESSION_ROOT, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && /^\d+$/.test(e.name))
      .map((e) => e.name);
  } catch (err) {
    logger.error('Failed to list stored sessions:', err.message);
    return [];
  }
}

export function sanitizeNumber(number) {
  const cleaned = String(number).replace(/\D/g, '');
  if (cleaned.length < 7 || cleaned.length > 15) {
    throw new Error('Invalid phone number length detected.');
  }
  return cleaned;
}
/**
 * ═══════════════════════════════════════════════════════════════════
 * 💾 DATABASE.JS — Enterprise JSON Persistence
 * ═══════════════════════════════════════════════════════════════════
 * Fast, lightweight, file-based database. Stores user session
 * metadata, stats, and global settings in /tmp/database/bot.json.
 */

import fs from 'fs-extra';
import path from 'path';
import { CONFIG } from '../config.js';
import logger from './logger.js';

const DB_ROOT = CONFIG.DB_DIR;
const DB_FILE = path.join(DB_ROOT, 'bot.json');

/**
 * Database file aur directory ko auto-create karta hai.
 */
async function ensureDb() {
  await fs.ensureDir(DB_ROOT);
  if (!(await fs.pathExists(DB_FILE))) {
    await fs.writeJson(DB_FILE, { 
      users: {}, 
      stats: { total_connected: 0 },
      global_settings: {
        antiDelete: true,  // By default ON
        antiCall: true     // By default ON
      }
    }, { spaces: 2 });
  }
}

/**
 * Database file ko read karta hai.
 */
export async function readDb() {
  try {
    await ensureDb();
    return await fs.readJson(DB_FILE);
  } catch (err) {
    logger.error('Database read failed:', err.message);
    return { users: {}, stats: { total_connected: 0 }, global_settings: { antiDelete: true, antiCall: true } };
  }
}

/**
 * Database file ko write karta hai.
 */
export async function writeDb(data) {
  try {
    await ensureDb();
    await fs.writeJson(DB_FILE, data, { spaces: 2 });
    return true;
  } catch (err) {
    logger.error('Database write failed:', err.message);
    return false;
  }
}

/**
 * Naya user save karta hai ya existing ko update karta hai.
 */
export async function setUser(number, payload) {
  const db = await readDb();
  db.users[number] = { ...(db.users[number] || {}), ...payload, updatedAt: Date.now() };
  return writeDb(db);
}

/**
 * Specific user ka data fetch karta hai.
 */
export async function getUser(number) {
  const db = await readDb();
  return db.users[number] || null;
}

/**
 * User ko database se remove karta hai.
 */
export async function removeUser(number) {
  const db = await readDb();
  delete db.users[number];
  return writeDb(db);
}
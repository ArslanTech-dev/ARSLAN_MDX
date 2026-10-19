/**
 * ═══════════════════════════════════════════════════════════════════
 * 💾 DATABASE.JS — Enterprise JSON Persistence
 * ═══════════════════════════════════════════════════════════════════
 */

import fs from 'fs-extra';
import path from 'path';
import { CONFIG } from '../config.js';
import logger from './logger.js';

const DB_ROOT = CONFIG.DB_DIR;
const DB_FILE = path.join(DB_ROOT, 'bot.json');

async function ensureDb() {
  await fs.ensureDir(DB_ROOT);
  if (!(await fs.pathExists(DB_FILE))) {
    await fs.writeJson(DB_FILE, { 
      users: {}, 
      stats: { total_connected: 0 },
      global_settings: { antiDelete: true, antiCall: true },
      group_settings: {} // 🆕 Groups ki settings yahan save hongi (Antilink, Welcome etc)
    }, { spaces: 2 });
  }
}

export async function readDb() {
  try {
    await ensureDb();
    return await fs.readJson(DB_FILE);
  } catch (err) {
    logger.error('Database read failed:', err.message);
    return { users: {}, global_settings: {}, group_settings: {} };
  }
}

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

export async function setUser(number, payload) {
  const db = await readDb();
  db.users[number] = { ...(db.users[number] || {}), ...payload, updatedAt: Date.now() };
  return writeDb(db);
}

export async function getUser(number) {
  const db = await readDb();
  return db.users[number] || null;
}

export async function removeUser(number) {
  const db = await readDb();
  delete db.users[number];
  return writeDb(db);
}

// 🆕 Group Settings Functions
export async function getGroupSettings(groupId) {
  const db = await readDb();
  return db.group_settings[groupId] || { antilink: false, antilink_action: 'warn', welcome: false, goodbye: false, antidelete: false };
}

export async function saveGroupSettings(groupId, settings) {
  const db = await readDb();
  db.group_settings[groupId] = { ...(db.group_settings[groupId] || {}), ...settings };
  return writeDb(db);
}
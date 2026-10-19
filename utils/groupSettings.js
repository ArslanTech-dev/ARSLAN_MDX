/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚙️ GROUP-SETTINGS.JS — Group Configuration Manager
 * ═══════════════════════════════════════════════════════════════════
 * This file handles reading and writing group-specific settings 
 * (like antilink, welcome, etc.) to the main bot.json database.
 */

import { readDb, writeDb } from './database.js';
import logger from './logger.js';

// Default settings for any new group that hasn't configured anything yet.
const DEFAULT_SETTINGS = {
  antilink: false,
  antilink_action: 'warn', // 'warn' or 'kick'
  antidelete: false,
  welcome: false,
  goodbye: false,
  mute: false
};

/**
 * Get settings for a specific group.
 * If the group doesn't have any settings yet, it returns the defaults.
 * 
 * @param {string} groupId - The WhatsApp Group JID (e.g., 123456@g.us)
 * @returns {Promise<Object>} - The group settings object.
 */
export async function getSettings(groupId) {
  try {
    // 1. Read the main database
    const db = await readDb();
    
    // 2. Ensure group_settings object exists
    if (!db.group_settings) db.group_settings = {};
    
    // 3. If group exists, return its settings merged with defaults (to prevent undefined errors)
    //    If not, return just the defaults.
    const currentSettings = db.group_settings[groupId] || {};
    const finalSettings = { ...DEFAULT_SETTINGS, ...currentSettings };

    // Print to terminal for debugging
    logger.debug(`[GroupSettings] Fetched settings for ${groupId}: AntiLink=${finalSettings.antilink}`);
    
    return finalSettings;
  } catch (err) {
    // If database fails to read, log error and return defaults so bot doesn't crash
    logger.error(`[GroupSettings] Failed to get settings (${groupId}):`, err.message);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save new settings for a specific group.
 * This merges new settings with existing ones (or defaults).
 * 
 * @param {string} groupId - The WhatsApp Group JID
 * @param {Object} newSettings - The settings to update (e.g., { antilink: true })
 * @returns {Promise<boolean>} - True if saved successfully.
 */
export async function saveSettings(groupId, newSettings) {
  try {
    // 1. Read the main database
    const db = await readDb();
    
    // 2. Ensure group_settings object exists
    if (!db.group_settings) db.group_settings = {};
    
    // 3. Merge defaults, existing settings, and new settings
    db.group_settings[groupId] = { 
      ...DEFAULT_SETTINGS, 
      ...(db.group_settings[groupId] || {}), 
      ...newSettings 
    };
    
    // 4. Write back to file
    await writeDb(db);

    // Print success to terminal
    logger.success(`[GroupSettings] Updated settings for ${groupId}:`, newSettings);
    
    return true;
  } catch (err) {
    logger.error(`[GroupSettings] Failed to save settings (${groupId}):`, err.message);
    return false;
  }
}
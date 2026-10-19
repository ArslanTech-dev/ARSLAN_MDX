/**
 * ═══════════════════════════════════════════════════════════════════
 * 📝 LOGGER.JS — Enterprise Console Output
 * ═══════════════════════════════════════════════════════════════════
 * Clean, colored, timestamped console outputs for monitoring 
 * system health and debugging. Silences Baileys internal noise.
 */

import pino from 'pino';

// Baileys ke internal noisy logs ko silence rakhte hain
export const baileysLogger = pino({ level: 'silent' });

// ANSI Color Codes
const C = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Clean Timestamp Generator (HH:MM:SS format)
const ts = () => new Date().toISOString().split('T')[1].slice(0, -1);

export const logger = {
  info:    (...a) => console.log(`${C.cyan}[SYSTEM]${C.reset}  [${ts()}]`, ...a),
  success: (...a) => console.log(`${C.green}[SUCCESS]${C.reset} [${ts()}]`, ...a),
  warn:    (...a) => console.warn(`${C.yellow}[WARNING]${C.reset} [${ts()}]`, ...a),
  error:   (...a) => console.error(`${C.red}[ERROR]${C.reset}   [${ts()}]`, ...a),
  debug:   (...a) => console.log(`${C.magenta}[DEBUG]${C.reset}   [${ts()}]`, ...a),
};

export default logger;
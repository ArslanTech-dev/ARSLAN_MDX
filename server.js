/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌐 SERVER.JS — Express API (Universal Port Binding)
 * ═══════════════════════════════════════════════════════════════════
 * Supports: Termux, Bot-Hosting, Pxxl, nodeX, Render, VPS
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import logger from './utils/logger.js';
import { sanitizeNumber } from './utils/sessionManager.js';
import {
  initSessionManager,
  createPairingCode,
  unpairUser,
  getSessionList,
  activeSessions,
} from './index.js';

const app = express();

// ═══════════════════════════════════════════════════════════════════
// 🛡️ MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// ═══════════════════════════════════════════════════════════════════
// 📡 API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

// Health Check
app.get('/', (req, res) => {
  res.json({
    ok: true,
    bot: CONFIG.BOT_NAME,
    version: CONFIG.BOT_VERSION,
    status: 'Server is running'
  });
});

// Generate Pairing Code
app.post('/api/pair', async (req, res) => {
  try {
    const { number } = req.body || {};
    if (!number) {
      return res.status(400).json({ success: false, error: 'Number is required.' });
    }

    let cleanNum;
    try {
      cleanNum = sanitizeNumber(number);
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid phone number format.' });
    }

    if (activeSessions.size >= CONFIG.MAX_SESSIONS && !activeSessions.has(cleanNum)) {
      return res.status(429).json({ success: false, error: `Max limit of ${CONFIG.MAX_SESSIONS} sessions reached.` });
    }

    const code = await createPairingCode(cleanNum);
    return res.json({ success: true, code });

  } catch (err) {
    logger.error('Pair API Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get Active Sessions
app.get('/api/status', (req, res) => {
  try {
    const sessions = getSessionList();
    res.json({
      success: true,
      totalSessions: sessions.length,
      maxSessions: CONFIG.MAX_SESSIONS,
      sessions,
    });
  } catch (err) {
    logger.error('Status API Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch status.' });
  }
});

// Unpair Session
app.post('/api/unpair', async (req, res) => {
  try {
    const { number } = req.body || {};
    if (!number) {
      return res.status(400).json({ success: false, error: 'Number is required.' });
    }
    const cleanNum = sanitizeNumber(number);
    const ok = await unpairUser(cleanNum);
    return res.json({ success: ok });
  } catch (err) {
    logger.error('Unpair API Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// 🚀 BOOT & PORT BINDING (Universal Fix)
// ═══════════════════════════════════════════════════════════════════

// 🚀 CRITICAL: SERVER_PORT for Bot-Hosting, PORT for others
const port = process.env.SERVER_PORT || process.env.PORT || CONFIG.PORT || 3000;

(async () => {
  try {
    await initSessionManager();
    
    app.listen(port, '0.0.0.0', () => {
      logger.success(`🌐 ARSLAN MDX running on 0.0.0.0:${port}`);
      logger.info(`📍 Access the dashboard at: http://localhost:${port}`);
    });
  } catch (err) {
    logger.error('Server boot failed:', err);
    process.exit(1);
  }
})();
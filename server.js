/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌐 SERVER.JS — Express API (Universal Port & Assets Fix)
 * ═══════════════════════════════════════════════════════════════════
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

// 1. CORS (Frontend ko connect hone do)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. JSON Body Parser
app.use(express.json({ limit: '1mb' }));

// 3. Serve Frontend (index.html, config.js)
app.use(express.static('public'));

// 4. Serve Assets (webbanner.png, community.png, Welcome.png)
// 👈 YEH LINE IMAGES KO FIX KAREGI
app.use('/assets', express.static('assets'));

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

// POST /api/pair
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

    // Create pairing code
    const code = await createPairingCode(cleanNum);
    return res.json({ success: true, code });

  } catch (err) {
    logger.error('Pair API Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/status
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

// POST /api/unpair
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
// 🚀 BOOT & PORT BINDING (CRITICAL CLOUD FIX)
// ═══════════════════════════════════════════════════════════════════

// Bot-Hosting uses SERVER_PORT. Others use PORT.
const port = process.env.SERVER_PORT || process.env.PORT || CONFIG.PORT || 3000;

(async () => {
  try {
    // Initialize /tmp/sessions folder
    await initSessionManager();

    // Bind to 0.0.0.0 so cloud platforms can route traffic
    app.listen(port, '0.0.0.0', () => {
      logger.success(`🌐 ARSLAN MDX running on 0.0.0.0:${port}`);
    });
  } catch (err) {
    logger.error('Server boot failed:', err);
    process.exit(1);
  }
})();
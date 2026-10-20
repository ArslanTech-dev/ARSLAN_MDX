/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌐 SERVER.JS — Express API (Cloud-Safe Edition)
 * ═══════════════════════════════════════════════════════════════════
 * Handles the frontend API requests and binds to 0.0.0.0
 * for compatibility with Pxxl, SnapDeploy, Render, etc.
 */

import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import logger from './utils/logger.js';
import { sanitizeNumber } from './utils/sessionManager.js';

// Import core functions from index.js
import {
  initSessionManager,
  createPairingCode,
  unpairUser,
  getSessionList,
  activeSessions,
} from './index.js';

const app = express();

// ═══════════════════════════════════════════════════════════════════
// 🛡️ MIDDLEWARE (Crucial for Frontend to Backend communication)
// ═══════════════════════════════════════════════════════════════════

// 1. CORS: Allow requests from any origin (fixes "Failed to fetch")
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. JSON Body Parser
app.use(express.json({ limit: '1mb' }));

// 3. Serve Static Files (Serves the index.html and config.js from 'public' folder)
app.use(express.static('public'));

// ═══════════════════════════════════════════════════════════════════
// 📡 API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

// 1. Health Check (Root URL)
// Agar aap browser mein pxxl-url/ kholein ge, toh yeh JSON dikhega
app.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    bot: CONFIG.BOT_NAME, 
    version: CONFIG.BOT_VERSION,
    status: 'Server is running'
  });
});

// 2. Generate Pairing Code
app.post('/api/pair', async (req, res) => {
  try {
    const { number } = req.body || {};
    if (!number) {
      return res.status(400).json({ success: false, error: 'Number is required.' });
    }

    let cleanNum;
    try {
      cleanNum = sanitizeNumber(number);
    } catch (err) {
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

// 3. Get Active Sessions
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

// 4. Unpair Session
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
const port = process.env.PORT || CONFIG.PORT || 3000;

(async () => {
  try {
    // Initialize /tmp/sessions folder
    await initSessionManager();
    
    // Bind to 0.0.0.0 so Pxxl can route external traffic to it
    app.listen(port, '0.0.0.0', () => {
      logger.success(`🌐 ARSLAN MDX running on 0.0.0.0:${port}`);
    });
  } catch (err) {
    logger.error('Server boot failed:', err);
    process.exit(1);
  }
})();
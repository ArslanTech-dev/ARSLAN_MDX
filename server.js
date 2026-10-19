/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌐 SERVER.JS — Express API (Cloud-safe, 0.0.0.0 bind)
 * ═══════════════════════════════════════════════════════════════════
 */

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
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

app.get('/', (req, res) => res.json({ ok: true, bot: CONFIG.BOT_NAME }));

// POST /api/pair
app.post('/api/pair', async (req, res) => {
  try {
    const { number } = req.body || {};
    if (!number) return res.status(400).json({ success: false, error: 'Number required' });

    let cleanNum;
    try {
      cleanNum = sanitizeNumber(number);
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid phone number' });
    }

    if (activeSessions.size >= CONFIG.MAX_SESSIONS && !activeSessions.has(cleanNum)) {
      return res.status(429).json({ success: false, error: `Max ${CONFIG.MAX_SESSIONS} sessions` });
    }

    const code = await createPairingCode(cleanNum);
    return res.json({ success: true, code });
  } catch (err) {
    logger.error('Pair API:', err.message);
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
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/unpair
app.post('/api/unpair', async (req, res) => {
  try {
    const { number } = req.body || {};
    if (!number) return res.status(400).json({ success: false, error: 'Number required' });
    const cleanNum = sanitizeNumber(number);
    const ok = await unpairUser(cleanNum);
    return res.json({ success: ok });
  } catch (err) {
    logger.error('Unpair API:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

const port = process.env.PORT || CONFIG.PORT || 3000;

(async () => {
  await initSessionManager();
  app.listen(port, '0.0.0.0', () => {
    logger.success(`🌐 ARSLAN MDX running on 0.0.0.0:${port} 💖`);
  });
})().catch((err) => {
  logger.error('Boot failed:', err);
  process.exit(1);
});

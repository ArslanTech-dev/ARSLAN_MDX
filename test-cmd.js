/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧪 TEST-CMD.JS — Local Plugin Tester
 * ═══════════════════════════════════════════════════════════════════
 * Is file se aap bina WhatsApp ke commands test kar sakte hain.
 */

import { handleMessage } from './handlers/message.js';
import logger from './utils/logger.js';

// 1. Fake Socket (Jo WhatsApp ki tarah reply print karega)
const mockSock = {
  user: { id: '923037314690:1@s.whatsapp.net' },
  sendMessage: async (jid, content, options) => {
    console.log('\n=============================================');
    console.log('📤 BOT REPLY SENT TO:', jid);
    if (content.text) console.log('📝 TEXT:', content.text);
    if (content.image) console.log('🖼️ IMAGE: [Buffer Data]');
    if (content.react) console.log('⚡ REACTION:', content.react.text);
    console.log('=============================================\n');
  },
  readMessages: async () => {},
  groupMetadata: async () => ({ participants: [] }),
  sendPresenceUpdate: async () => {}
};

// 2. Fake Message (Jo aapki taraf se aaya hua hai)
const mockMsg = {
  key: {
    remoteJid: '923001234567@s.whatsapp.net', // Kisi dost ka chat
    fromMe: false,                            // Dost ne bheja hai
    id: 'MOCK_MSG_ID_' + Date.now()
  },
  message: {
    conversation: '.ping'                     // 👈 YAHAN COMMAND BADLEIN (e.g. .menu, .alive)
  },
  messageTimestamp: Math.floor(Date.now() / 1000)
};

// 3. Trigger the handler
async function runTest() {
  logger.info(`🧪 Triggering local test for command: ${mockMsg.message.conversation}`);
  await handleMessage(mockSock, mockMsg, '923037314690');
}

runTest();

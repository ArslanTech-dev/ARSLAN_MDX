/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧰 HELPER.JS — Core Utilities & Formatting
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Extracts a clean phone number from a WhatsApp JID.
 * Example: "92300...@s.whatsapp.net" -> "92300..."
 */
export function cleanJid(jid) {
  if (!jid) return '';
  return jid.split('@')[0].split(':')[0].replace(/\D/g, '');
}

/**
 * Converts a clean number into a standard user JID.
 * Example: "92300..." -> "92300...@s.whatsapp.net"
 */
export function toUserJid(number) {
  return `${String(number).replace(/\D/g, '')}@s.whatsapp.net`;
}

/**
 * Converts milliseconds into a readable uptime string.
 * Example: "2h 15m 30s"
 */
export function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

/**
 * Safely extracts text from any Baileys message object
 * (handles text, image/video captions, button replies, etc).
 */
export function extractText(msg) {
  const m = msg.message;
  if (!m) return '';
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.buttonsResponseMessage?.selectedButtonId ||
    m.listResponseMessage?.singleSelectReply?.selectedRowId ||
    ''
  ).trim();
}
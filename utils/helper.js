/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧰 HELPER.JS — Core Utilities & Formatting
 * ═══════════════════════════════════════════════════════════════════
 */

import { CONFIG } from '../config.js'; // 👈 Import CONFIG

export function cleanJid(jid) {
  if (!jid) return '';
  return jid.split('@')[0].split(':')[0].replace(/\D/g, '');
}

export function toUserJid(number) {
  return `${String(number).replace(/\D/g, '')}@s.whatsapp.net`;
}

export function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

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

export function isGroup(jid) {
  return jid ? jid.endsWith('@g.us') : false;
}

// 🚀 Yahan OWNER_NUMBER CONFIG se aa raha hai
export function isOwner(jid) {
  return cleanJid(jid) === CONFIG.OWNER_NUMBER;
}

export function getSender(msg) {
  return msg.key.participant || msg.key.remoteJid;
}

export function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
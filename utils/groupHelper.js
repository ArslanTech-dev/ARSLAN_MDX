/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧭 GROUPHELPER.JS — ARSLAN MDX · LID-safe identity / admin / mention helpers
 * ═══════════════════════════════════════════════════════════════════
 * Problem: naye WhatsApp groups mein participants ke ids `xxxx@lid` hote hain,
 * jab ke bot ka number `923xxxx@s.whatsapp.net` hota hai. Sirf number compare
 * karne se bot khud ko admin nahi pehchanta ("I need to be Admin!").
 *
 * Yahan har banday ki saari identities (PN + LID + phoneNumber) compare hoti
 * hain, group metadata cache hota hai, aur mentions sahi jid se bante hain.
 * ═══════════════════════════════════════════════════════════════════
 */

import { normalizeMessageContent } from '@whiskeysockets/baileys';
import logger from './logger.js';

// ───────────────────────── Basics ─────────────────────────
export const digits = (jid) =>
  String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

export const isLidJid = (jid) => String(jid || '').endsWith('@lid');

const intersects = (a, b) => {
  for (const x of a) if (x && b.has(x)) return true;
  return false;
};

// ───────────────────────── Bot identity ─────────────────────────
/** Bot ki saari pehchan: PN number + LID number (dono) */
export function getBotIdentity(sock) {
  const me = sock?.user || {};
  const credsMe = sock?.authState?.creds?.me || {};
  const pn = digits(me.id || credsMe.id);
  const lid = digits(me.lid || credsMe.lid);
  return {
    pn,
    lid,
    pnJid: pn ? `${pn}@s.whatsapp.net` : null,
    lidJid: lid ? `${lid}@lid` : null,
    ids: new Set([pn, lid].filter(Boolean))
  };
}

/** Kya ye jid bot ka apna hai? (PN ya LID kisi bhi form mein) */
export function isBotJid(sock, jid) {
  const id = getBotIdentity(sock);
  const d = digits(jid);
  return !!d && id.ids.has(d);
}

// ───────────────────────── Participant identities ─────────────────────────
/** Participant ki saari pehchan (id, lid, phoneNumber...) digits ke set ki shakal mein */
export function participantIds(p) {
  const set = new Set();
  if (!p) return set;
  for (const v of [p.id, p.lid, p.phoneNumber, p.jid, p.pn, p.participant]) {
    const d = digits(v);
    if (d) set.add(d);
  }
  return set;
}

export const isAdminFlag = (p) => p?.admin === 'admin' || p?.admin === 'superadmin' || p?.admin === true;

export function findParticipant(meta, idSet) {
  const wanted = idSet instanceof Set ? idSet : new Set([...idSet].map(digits).filter(Boolean));
  return meta?.participants?.find((p) => intersects(participantIds(p), wanted)) || null;
}

/** Message bhejne walay ki saari possible identities */
export function collectSenderIds(msg, sender) {
  const set = new Set();
  const key = msg?.key || {};
  for (const v of [sender, key.participant, key.participantAlt, key.remoteJidAlt, msg?.participant]) {
    const d = digits(v);
    if (d) set.add(d);
  }
  if (key.fromMe === true) return set; // caller bot identity alag add karta hai
  if (!String(key.remoteJid || '').endsWith('@g.us')) {
    const d = digits(key.remoteJid);
    if (d) set.add(d);
  }
  return set;
}

// ───────────────────────── Group metadata cache ─────────────────────────
const META_TTL = 60 * 1000;
const metaCache = new Map(); // groupJid -> { meta, ts }
const inflight = new Map();

export function getCachedMeta(groupJid) {
  return metaCache.get(groupJid)?.meta || null;
}

export function invalidateGroupMeta(groupJid) {
  if (groupJid) metaCache.delete(groupJid);
}

export async function getGroupMeta(sock, groupJid, { fresh = false } = {}) {
  if (!groupJid) return null;
  const hit = metaCache.get(groupJid);
  if (!fresh && hit && Date.now() - hit.ts < META_TTL) return hit.meta;

  if (inflight.has(groupJid)) return inflight.get(groupJid);

  const job = (async () => {
    try {
      const meta = await sock.groupMetadata(groupJid);
      metaCache.set(groupJid, { meta, ts: Date.now() });
      if (metaCache.size > 300) metaCache.delete(metaCache.keys().next().value);
      return meta;
    } catch (err) {
      logger.error?.(`[GROUP] metadata failed (${groupJid}): ${err.message}`);
      return hit?.meta || null; // purana cache chalega
    } finally {
      inflight.delete(groupJid);
    }
  })();

  inflight.set(groupJid, job);
  return job;
}

// ───────────────────────── Admin checks ─────────────────────────
/** Bot is group mein admin hai? (PN + LID dono se match) */
export async function isBotAdminIn(sock, groupJid) {
  const id = getBotIdentity(sock);
  if (!id.ids.size) return false;

  for (const fresh of [false, true]) {
    const meta = await getGroupMeta(sock, groupJid, { fresh });
    if (!meta) return false;
    const me = findParticipant(meta, id.ids);
    if (me) return isAdminFlag(me);
    // bot mila hi nahi (shayad cache purana) -> ek baar fresh try
  }
  return false;
}

/** Ye user (ids = jid/number list) is group mein admin hai? */
export async function isUserAdmin(sock, groupJid, ids) {
  const set = new Set([...ids].map(digits).filter(Boolean));
  if (!set.size) return false;

  // Bot khud (fromMe) ho to bot identity bhi jodo
  const meta = await getGroupMeta(sock, groupJid);
  const p = findParticipant(meta, set);
  return p ? isAdminFlag(p) : false;
}

// ───────────────────────── Target / mention helpers ─────────────────────────
/** @mention ya reply se target jid */
export function getTargetJid(msg) {
  try {
    const content = normalizeMessageContent(msg?.message) || msg?.message || {};
    const info = Object.values(content).find((v) => v && typeof v === 'object' && v.contextInfo)?.contextInfo;
    const mentioned = info?.mentionedJid?.[0];
    if (mentioned) return mentioned;
    if (info?.quotedMessage && info.participant) return info.participant;
  } catch {}
  return null;
}

/** "@923..." tags text mein ho to unke jids nikalo (jid ka user-part == tag ke digits) */
export function autoMentions(text, meta) {
  const out = new Set();
  const re = /@(\d{5,20})/g;
  let m;
  while ((m = re.exec(String(text || '')))) {
    const d = m[1];
    const p = meta ? findParticipant(meta, new Set([d])) : null;
    // LID digits ho to @lid, warna @s.whatsapp.net — jid ka user-part hamesha tag jaisa
    const isLid = p && digits(p.lid) === d || (p && digits(p.id) === d && isLidJid(p.id));
    out.add(isLid ? `${d}@lid` : `${d}@s.whatsapp.net`);
  }
  return [...out];
}

/** Mention ka best jid: PN mile to PN (number parha ja sake), warna jo mila */
export function bestMentionJid(...candidates) {
  const list = candidates.filter(Boolean);
  return list.find((j) => String(j).endsWith('@s.whatsapp.net')) || list[0] || null;
}

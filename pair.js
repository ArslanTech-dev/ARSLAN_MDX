/**
 * ═══════════════════════════════════════════════════════════════════
 * 🔐 PAIR.JS — Pairing Code Helpers
 * ═══════════════════════════════════════════════════════════════════
 * Utilities for formatting & validating pairing codes.
 * The core pairing flow is handled in index.js.
 */

/**
 * Formats a raw code into WhatsApp's standard 'XXXX-XXXX' format.
 */
export function formatPairingCode(code) {
  const cleaned = String(code).replace(/-/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  return cleaned;
}

/**
 * Basic phone number validation for the pairing flow.
 */
export function validatePairingInput(number) {
  const cleaned = String(number || '').replace(/\D/g, '');
  if (cleaned.length < 7 || cleaned.length > 15) {
    return { ok: false, error: 'Invalid phone number format.' };
  }
  return { ok: true, number: cleaned };
}

/**
 * Returns the UI instruction text for users.
 */
export function getPairingInstructions() {
  return (
    'On WhatsApp:\n' +
    '1. Open *Settings*\n' +
    '2. Go to *Linked Devices*\n' +
    '3. Tap *Link with phone number*\n' +
    '4. Enter the 8-digit code shown\n\n' +
    '⏱ You have 60 seconds.'
  );
}

export default { formatPairingCode, validatePairingInput, getPairingInstructions };
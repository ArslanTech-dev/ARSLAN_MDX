/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌐 CONFIG.JS — ARSLAN MDX · Frontend API Router
 * ═══════════════════════════════════════════════════════════════════
 * Automatically detects the API URL based on the environment.
 * - Localhost: Points to http://localhost:3000
 * - Production (Pxxl/Vercel): Points to the current live URL.
 */

(function () {
  // 1. Check if running locally
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  // 2. Set the API URL
  window.ARSLAN_API_URL = isLocal
    ? 'http://localhost:3000'
    : window.location.origin; // 👈 Automatically uses the Pxxl URL

  // 3. Clean up trailing slash (if any) to prevent API endpoint errors
  window.ARSLAN_API_URL = window.ARSLAN_API_URL.replace(/\/$/, '');

  // 4. Log for debugging (visible in browser console)
  console.log(`[ARSLAN MDX] System Environment: ${isLocal ? 'LOCAL' : 'PRODUCTION'}`);
  console.log(`[ARSLAN MDX] API Endpoint routed to: ${window.ARSLAN_API_URL}`);
})();
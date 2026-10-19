/**
 * ═══════════════════════════════════════════════════════════════════
 * 🌐 CONFIG.JS — Frontend API Routing (ARSLAN MDX)
 * ═══════════════════════════════════════════════════════════════════
 * This file dynamically sets the API URL based on the environment.
 * - Localhost: Points to your local backend (port 3000).
 * - Production: Points to your cloud backend (SnapDeploy / Pxxl).
 */

(function () {
  // 🎯 Determine if the frontend is running locally or in the cloud
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  // 🎯 Set the API URL
  window.ARSLAN_API_URL = isLocal
    ? 'http://localhost:3000'
    : 'https://YOUR-BACKEND-URL.snapdeploy.app'; // 👈 APNA CLOUD BACKEND URL YAHAN DAALEIN

  // Optional: Debugging log for developers
  console.log(
    `[ARSLAN MDX] System environment: ${isLocal ? 'LOCAL' : 'PRODUCTION'}`
  );
  console.log(`[ARSLAN MDX] API Endpoint routed to: ${window.ARSLAN_API_URL}`);
})();
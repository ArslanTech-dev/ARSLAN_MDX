/**
 * 🌐 CONFIG.JS — Frontend API Routing (ARSLAN MDX)
 */
(function () {
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  // 👇 APNA ASLI PXXL URL YAHAN DAALEIN
  window.ARSLAN_API_URL = isLocal
    ? 'http://localhost:3000'
    : 'https://arslanmdx.pxxlspace.cv'; // 👈 Apne screenshot wala URL yahan likhein

  console.log(`[ARSLAN MDX] API Endpoint: ${window.ARSLAN_API_URL}`);
})();
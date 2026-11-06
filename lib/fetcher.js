export async function safeFetch(url, options = {}) {
  const defaultOptions = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, image/*, */*'
    },
    signal: AbortSignal.timeout(15000)
  };
  const mergedOptions = { ...defaultOptions, ...options, headers: { ...defaultOptions.headers, ...options.headers } };

  try {
    const res = await fetch(url, mergedOptions);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    return res;
  } catch (err) {
    throw new Error(err.message || 'Fetch failed');
  }
}
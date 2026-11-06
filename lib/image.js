import { safeFetch } from './fetcher.js';
import { CONFIG } from '../config.js';

export async function getUnsplashImage(query) {
  if (!CONFIG.UNSPLASH_ACCESS_KEY) throw new Error('Unsplash key missing');
  const res = await safeFetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${CONFIG.UNSPLASH_ACCESS_KEY}`);
  const data = await res.json();
  return data.urls.regular;
}

export async function getPiesImage(country) {
  const res = await safeFetch(`https://shizoapi.onrender.com/api/pies/${country}?apikey=shizo`);
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('image')) throw new Error('Invalid image response');
  return Buffer.from(await res.arrayBuffer());
}
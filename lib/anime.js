import { safeFetch } from './fetcher.js';

export async function getAnimeGif(type = 'kiss') {
  // Allowed: kiss, hug, slap, pat, cuddle, wink
  const res = await safeFetch(`https://api.waifu.pics/sfw/${type}`);
  const data = await res.json();
  return data.url;
}
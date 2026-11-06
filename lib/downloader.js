import { safeFetch } from './fetcher.js';
import ytdl from '@distube/ytdl-core';

export async function downloadTikTok(url) {
  const res = await safeFetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  if (data.code !== 0) throw new Error('TikTok download failed');
  return { video: data.data.play, audio: data.data.music, title: data.data.title };
}

export async function downloadYT(url) {
  const info = await ytdl.getInfo(url);
  const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
  return { video: format.url, title: info.videoDetails.title };
}
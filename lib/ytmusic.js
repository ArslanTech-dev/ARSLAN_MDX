/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎵 YTMUSIC.JS — YouTube Audio Downloader (3-Layer Fallback)
 * ═══════════════════════════════════════════════════════════════════
 * Method 1: playmp3 (Direct)
 * Method 2: search + ytmp3
 * Method 3: NexOracle API Fallback
 */

import { playmp3, ytmp3, search } from '@kelvdra/scraper';
import logger from '../utils/logger.js';

export async function downloadYouTubeAudio(query) {
  let title, author, duration, views, audioUrl;

  // 🚀 METHOD 1: Try playmp3 (Direct Search + Download)
  try {
    const data = await playmp3(query);
    title = data.title || data.result?.title;
    author = data.author || data.result?.author;
    duration = data.duration || data.result?.duration;
    views = data.views || data.result?.views;
    audioUrl = data.audio || data.dl_url || data.url || data.download_url || data.result?.audio || data.result?.dl_url;
    
    if (audioUrl) logger.info(`[YTMUSIC] Method 1 (playmp3) succeeded`);
  } catch (e) {
    logger.warn(`[YTMUSIC] Method 1 failed: ${e.message}`);
  }

  // 🚀 METHOD 2: Search + ytmp3
  if (!audioUrl) {
    try {
      const searchRes = await search(query);
      const videos = searchRes.videos ? searchRes.videos : (Array.isArray(searchRes) ? searchRes : []);
      
      if (videos && videos.length > 0) {
        const video = videos[0];
        const videoUrl = video.url || `https://youtube.com/watch?v=${video.videoId}`;
        
        const data = await ytmp3(videoUrl);
        title = data.title || video.title;
        author = data.author || video.author;
        duration = data.duration || video.duration;
        views = data.views || video.views;
        audioUrl = data.audio || data.dl_url || data.url || data.download_url;
        
        if (audioUrl) logger.info(`[YTMUSIC] Method 2 (ytmp3) succeeded`);
      }
    } catch (e) {
      logger.warn(`[YTMUSIC] Method 2 failed: ${e.message}`);
    }
  }

  // 🚀 METHOD 3: Fallback to NexOracle API
  if (!audioUrl) {
    try {
      const res = await fetch(`https://api.nexoracle.com/downloader/yt-play?q=${encodeURIComponent(query)}&apikey=free_key@maher_apis`);
      const apiData = await res.json();
      
      if (apiData.status && apiData.result) {
        title = apiData.result.title;
        author = apiData.result.author;
        duration = apiData.result.duration;
        views = apiData.result.views;
        audioUrl = apiData.result.audio;
        
        if (audioUrl) logger.info(`[YTMUSIC] Method 3 (NexOracle) succeeded`);
      }
    } catch (e) {
      logger.warn(`[YTMUSIC] Method 3 failed: ${e.message}`);
    }
  }

  if (!audioUrl) throw new Error('All download methods failed.');

  return { title, author, duration, views, audioUrl };
}
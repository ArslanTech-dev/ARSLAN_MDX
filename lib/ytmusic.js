/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎵 YTMUSIC.JS — Reliable YouTube Audio Downloader
 * ═══════════════════════════════════════════════════════════════════
 */

import axios from 'axios';
import yts from 'yt-search';
import logger from '../utils/logger.js';

const DL_API = 'https://api.qasimdev.dpdns.org/api/loaderto/download';
const API_KEY = 'xbps-install-Syu';

const wait = (ms) => new Promise(r => setTimeout(r, ms));

const downloadWithRetry = async (url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const { data } = await axios.get(DL_API, {
                params: { apiKey: API_KEY, format: 'mp3', url },
                timeout: 120000
            });
            
            if (data?.data?.downloadUrl) return data.data;
            throw new Error('No download URL received.');
            
        } catch (err) {
            if (i === retries - 1) throw err;
            logger.warn(`[YTMUSIC] Download attempt ${i + 1} failed, retrying in 5s...`);
            await wait(5000);
        }
    }
    throw new Error('All download attempts failed');
};

export async function downloadYouTubeAudio(query) {
  let video;

  // 🚀 1. Check if it's a URL or a Search Query
  if (query.includes('youtube.com') || query.includes('youtu.be')) {
      video = { url: query };
  } else {
      const { videos } = await yts(query);
      if (!videos || videos.length === 0) {
          throw new Error('No results found for your query.');
      }
      video = videos[0];
  }

  // 🚀 2. Download the audio
  const audio = await downloadWithRetry(video.url);

  return {
    title: audio.title || video.title || query,
    author: video.author?.name || 'Unknown',
    duration: video.timestamp || 'Unknown',
    views: video.views ? video.views.toLocaleString() : 'N/A',
    audioUrl: audio.downloadUrl
  };
}
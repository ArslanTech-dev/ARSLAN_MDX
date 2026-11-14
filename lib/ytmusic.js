/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎵 YTMUSIC.JS — Reliable YouTube Audio Downloader (Multi-API)
 * ═══════════════════════════════════════════════════════════════════
 */

import axios from 'axios';
import yts from 'yt-search';
import logger from '../utils/logger.js';

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// 🚀 Multiple APIs (Agar ek fail ho toh doosri try karega)
const API_LIST = [
    {
        name: 'Vreden',
        url: (url) => `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`,
        extract: (data) => data?.result?.download?.url || data?.result?.url
    },
    {
        name: 'Zenkey',
        url: (url) => `https://api.zenkey.my.id/download/ytmp3?url=${encodeURIComponent(url)}`,
        extract: (data) => data?.result?.url
    },
    {
        name: 'Nyxs',
        url: (url) => `https://api.nyxs.pw/downloader/ytmp3?url=${encodeURIComponent(url)}`,
        extract: (data) => data?.data?.url || data?.result?.url
    }
];

const downloadAudio = async (videoUrl) => {
    let lastError = null;

    for (const api of API_LIST) {
        for (let i = 0; i < 2; i++) { // Har API pe 2 retries
            try {
                logger.info(`[YTMUSIC] Trying ${api.name} (Attempt ${i + 1})...`);
                const { data } = await axios.get(api.url(videoUrl), { timeout: 30000 });
                const downloadUrl = api.extract(data);

                if (downloadUrl) {
                    logger.info(`[YTMUSIC] ✅ Success from ${api.name}`);
                    return { downloadUrl };
                }
                throw new Error(`No download URL from ${api.name}`);

            } catch (err) {
                lastError = err;
                logger.warn(`[YTMUSIC] ${api.name} failed: ${err.message}`);
                await wait(2000); // 2 sec wait before retry/next API
            }
        }
    }
    
    throw new Error(lastError?.message || 'All download APIs failed');
};

export async function downloadYouTubeAudio(query) {
    let video;

    // 🚀 1. Check if it's a URL or a Search Query
    if (query.includes('youtube.com') || query.includes('youtu.be')) {
        video = { url: query, title: 'YouTube Audio' };
    } else {
        const { videos } = await yts(query);
        if (!videos || videos.length === 0) {
            throw new Error('No results found for your query.');
        }
        video = videos[0];
    }

    // 🚀 2. Download the audio (using fallback system)
    const audio = await downloadAudio(video.url);

    return {
        title: audio.title || video.title || query,
        author: video.author?.name || 'Unknown',
        duration: video.timestamp || 'Unknown',
        views: video.views ? video.views.toLocaleString() : 'N/A',
        audioUrl: audio.downloadUrl
    };
}
/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎵 YTMUSIC.JS — Reliable YouTube Audio (Piped API + Fallbacks)
 * ═══════════════════════════════════════════════════════════════════
 */

import axios from 'axios';
import yts from 'yt-search';
import logger from '../utils/logger.js';

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// 🚀 Helper: Extract Video ID
function getVideoId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
}

// 🚀 API List (Piped Instances + Backups)
const API_LIST = [
    {
        name: 'Piped-Kavin',
        url: (id) => `https://pipedapi.kavin.rocks/streams/${id}`,
        extract: (data) => {
            if (!data.audioStreams || !data.audioStreams.length) return null;
            const stream = data.audioStreams.find(s => s.mimeType.includes('mp4')) || data.audioStreams[0];
            return { downloadUrl: stream.url, title: data.title };
        }
    },
    {
        name: 'Piped-Tokhmi',
        url: (id) => `https://pipedapi.tokhmi.xyz/streams/${id}`,
        extract: (data) => {
            if (!data.audioStreams || !data.audioStreams.length) return null;
            const stream = data.audioStreams.find(s => s.mimeType.includes('mp4')) || data.audioStreams[0];
            return { downloadUrl: stream.url, title: data.title };
        }
    },
    {
        name: 'Piped-Mha.fi',
        url: (id) => `https://api-piped.mha.fi/streams/${id}`,
        extract: (data) => {
            if (!data.audioStreams || !data.audioStreams.length) return null;
            const stream = data.audioStreams.find(s => s.mimeType.includes('mp4')) || data.audioStreams[0];
            return { downloadUrl: stream.url, title: data.title };
        }
    }
];

const downloadAudio = async (videoUrl) => {
    const videoId = getVideoId(videoUrl);
    if (!videoId) throw new Error('Invalid YouTube URL');

    let lastError = null;

    for (const api of API_LIST) {
        for (let i = 0; i < 2; i++) {
            try {
                logger.info(`[YTMUSIC] Trying ${api.name} (Attempt ${i + 1})...`);
                const { data } = await axios.get(api.url(videoId), { 
                    timeout: 20000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                
                const result = api.extract(data);
                if (result && result.downloadUrl) {
                    logger.info(`[YTMUSIC] ✅ Success from ${api.name}`);
                    return result;
                }
                throw new Error(`No audio stream from ${api.name}`);

            } catch (err) {
                lastError = err;
                logger.warn(`[YTMUSIC] ${api.name} failed: ${err.message}`);
                await wait(2000); // Wait 2s before retry/next API
            }
        }
    }
    
    throw new Error(lastError?.message || 'All download APIs failed. Please try again later.');
};

export async function downloadYouTubeAudio(query) {
    let video;

    // 🚀 1. Check URL or Search
    if (query.includes('youtube.com') || query.includes('youtu.be')) {
        video = { url: query, title: 'YouTube Audio' };
    } else {
        const { videos } = await yts(query);
        if (!videos || videos.length === 0) {
            throw new Error('No results found for your query.');
        }
        video = videos[0];
    }

    // 🚀 2. Download
    const audio = await downloadAudio(video.url);

    return {
        title: audio.title || video.title || query,
        author: video.author?.name || 'Unknown',
        duration: video.timestamp || 'Unknown',
        views: video.views ? video.views.toLocaleString() : 'N/A',
        audioUrl: audio.downloadUrl
    };
}
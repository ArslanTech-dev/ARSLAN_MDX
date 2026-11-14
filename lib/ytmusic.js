import yts from 'yt-search';
import logger from '../utils/logger.js';
import axios from 'axios';

// Timeout Helper (Agar koi API hang ho jaye toh 20 second mein cancel ho jaye)
const withTimeout = (promise, ms, errorMsg = 'Request Timed Out') => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
    ]);
};

export async function downloadYouTubeAudio(query) {
    let videoUrl = query;
    let videoTitle = 'Unknown';

    // 🚀 1. Search if not a URL (with 15s timeout)
    if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
        try {
            const searchRes = await withTimeout(yts(query), 15000, 'Search timed out.');
            if (!searchRes.videos || searchRes.videos.length === 0) {
                throw new Error('No results found.');
            }
            videoUrl = searchRes.videos[0].url;
            videoTitle = searchRes.videos[0].title;
        } catch (err) {
            logger.error(`[YTMUSIC] Search error: ${err.message}`);
            throw new Error('Search failed. Please try again.');
        }
    }

    logger.info(`[YTMUSIC] Downloading: ${videoUrl}`);

    // 🚀 2. Multiple API Fallbacks (Agar ek fail ho toh doosri try karega)
    const apis = [
        {
            name: 'Siputzx',
            url: `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`,
            extract: (d) => d?.data?.url || d?.data?.dl
        },
        {
            name: 'Vreden',
            url: `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}`,
            extract: (d) => d?.result?.download?.url
        },
        {
            name: 'Okatsu',
            url: `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`,
            extract: (d) => d?.result?.mp3
        }
    ];

    for (const api of apis) {
        try {
            logger.info(`[YTMUSIC] Trying API: ${api.name}`);
            const res = await withTimeout(axios.get(api.url), 20000, 'API timeout');
            const audioUrl = api.extract(res.data);

            if (audioUrl) {
                logger.info(`[YTMUSIC] ✅ Success from ${api.name}`);
                return {
                    title: videoTitle,
                    author: 'YouTube',
                    duration: 'Unknown',
                    views: 'N/A',
                    audioUrl: audioUrl
                };
            }
        } catch (err) {
            logger.warn(`[YTMUSIC] ${api.name} failed: ${err.message}`);
            // Agar fail ho toh next API pe jao
        }
    }

    throw new Error('All download servers are currently down. Please try again later.');
}
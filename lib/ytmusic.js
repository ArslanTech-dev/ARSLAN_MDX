import yts from 'yt-search';
import axios from 'axios';
import logger from '../utils/logger.js';

export async function downloadYouTubeAudio(query) {
    let videoUrl = query;
    let videoTitle = query;
    let videoAuthor = 'YouTube';
    let thumbnail = null;

    // 1. Agar URL nahi hai to search karo
    if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
        const searchRes = await yts(query);
        if (!searchRes.videos || searchRes.videos.length === 0) {
            throw new Error('No results found for your query.');
        }
        videoUrl = searchRes.videos[0].url;
        videoTitle = searchRes.videos[0].title;
        videoAuthor = searchRes.videos[0].author.name;
        thumbnail = searchRes.videos[0].thumbnail;
    }

    // 🚀 APIs List (Agar ek down ho to doosri try karega)
    const apis = [
        {
            name: 'Zenkey',
            url: `https://api.zenkey.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
            extract: (d) => d?.result?.url || d?.result?.download
        },
        {
            name: 'YanzBotz',
            url: `https://api.yanzbotz.my.id/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
            extract: (d) => d?.result?.url || d?.result?.download
        },
        {
            name: 'Okatsu',
            url: `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`,
            extract: (d) => d?.dl || d?.result?.mp3
        }
    ];

    let audioUrl = null;
    let lastError = null;

    for (const api of apis) {
        try {
            logger.info(`[PLAY] Trying API: ${api.name}`);
            const res = await axios.get(api.url, { timeout: 15000 });
            audioUrl = api.extract(res.data);
            
            if (audioUrl && typeof audioUrl === 'string' && audioUrl.startsWith('http')) {
                logger.info(`[PLAY] ✅ Success from ${api.name}`);
                break; // Link mil gaya, loop rok do
            }
        } catch (err) {
            lastError = err;
            logger.warn(`[PLAY] ${api.name} failed: ${err.message}`);
        }
    }

    if (!audioUrl) {
        throw new Error(lastError ? lastError.message : 'All download APIs are down.');
    }

    return {
        title: videoTitle,
        author: videoAuthor,
        duration: 'Unknown',
        audioUrl: audioUrl,
        thumbnail: thumbnail
    };
}
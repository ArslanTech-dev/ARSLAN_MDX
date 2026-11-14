import yts from 'yt-search';
import logger from '../utils/logger.js';
import { createRequire } from 'module';
import axios from 'axios';

const require = createRequire(import.meta.url);
const ytScraper = require('@denzy-official/youtube_scraper');

// Timeout helper (Taake bot hang na ho)
const withTimeout = (promise, ms) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request Timed Out. YouTube might be blocking.')), ms))
    ]);
};

export async function downloadYouTubeAudio(query) {
    let videoUrl = query;

    // 🚀 1. Search if not a URL
    if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
        const { videos } = await yts(query);
        if (!videos || videos.length === 0) throw new Error('No results found.');
        videoUrl = videos[0].url;
    }

    logger.info(`[YTMUSIC] Downloading: ${videoUrl}`);

    // 🚀 2. Try Scraper (Max 25 sec timeout)
    try {
        const result = await withTimeout(ytScraper.ytmp3(videoUrl), 25000);
        if (result && result.status && result.download?.url) {
            return {
                title: result.metadata?.title || 'Unknown',
                author: result.metadata?.author?.name || 'Unknown',
                duration: result.metadata?.timestamp || 'Unknown',
                views: result.metadata?.views?.toLocaleString() || 'N/A',
                audioUrl: result.download.url
            };
        }
        throw new Error('Scraper failed to get URL');
    } catch (scraperErr) {
        logger.warn(`[YTMUSIC] Scraper failed, trying API fallback...`);
        
        // 🚀 3. Fallback API (Agar scraper block ho jaye)
        try {
            const { data } = await withTimeout(
                axios.get(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}`),
                20000
            );
            if (data?.result?.download?.url) {
                return {
                    title: data.result.title || 'Unknown',
                    author: data.result.author || 'Unknown',
                    duration: data.result.duration || 'Unknown',
                    views: 'N/A',
                    audioUrl: data.result.download.url
                };
            }
            throw new Error('API Fallback failed');
        } catch (apiErr) {
            logger.error(`[YTMUSIC] All methods failed: ${apiErr.message}`);
            throw new Error('YouTube is currently blocking downloads. Please wait 5 minutes and try again.');
        }
    }
}
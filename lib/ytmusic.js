/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎵 YTMUSIC.JS — Reliable YouTube Audio (Direct Scraper - No API)
 * ═══════════════════════════════════════════════════════════════════
 */

import yts from 'yt-search';
import logger from '../utils/logger.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ytScraper = require('@denzy-official/youtube_scraper');

export async function downloadYouTubeAudio(query) {
    let videoUrl = query;

    // 🚀 1. Check if it's a URL or a Search Query
    if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
        // Search directly using yt-search
        const { videos } = await yts(query);
        if (!videos || videos.length === 0) {
            throw new Error('No results found for your query.');
        }
        videoUrl = videos[0].url;
    }

    logger.info(`[YTMUSIC] Downloading audio for: ${videoUrl}`);

    // 🚀 2. Download using direct scraper (No APIs)
    try {
        const result = await ytScraper.ytmp3(videoUrl);

        if (!result || !result.status || !result.download?.url) {
            throw new Error('Failed to extract audio URL.');
        }

        const meta = result.metadata;
        const dl = result.download;

        return {
            title: meta.title || 'Unknown Title',
            author: meta.author?.name || 'Unknown',
            duration: meta.timestamp || dl.duration || 'Unknown',
            views: meta.views ? meta.views.toLocaleString() : 'N/A',
            audioUrl: dl.url
        };
    } catch (err) {
        logger.error(`[YTMUSIC] Scraper failed: ${err.message}`);
        throw new Error('Direct scraper failed. YouTube might be blocking the request.');
    }
}
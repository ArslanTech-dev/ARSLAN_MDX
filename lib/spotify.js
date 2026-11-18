/**
 * ═══════════════════════════════════════════════════════════════════
 * 🟢 SPOTIFY.JS — ARSLAN MDX · Spotify Audio Downloader
 * ═══════════════════════════════════════════════════════════════════
 */

import axios from 'axios';
import logger from '../utils/logger.js';

const HEADERS = {
    'Origin': 'https://spotifydown.com',
    'Referer': 'https://spotifydown.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

export async function downloadSpotifyAudio(query) {
    let trackId = null;
    let trackMeta = null;

    // 🚀 1. Agar URL hai toh Track ID nikaalo
    if (query.includes('spotify.com/track/')) {
        const match = query.match(/track\/([a-zA-Z0-9]+)/);
        if (match) trackId = match[1];
    }

    // 🚀 2. Agar URL nahi hai toh Spotify par Search karo
    if (!trackId) {
        try {
            logger.info(`[SPOTIFY] Searching for: ${query}`);
            const searchRes = await axios.get(`https://api.spotifydown.com/search/${encodeURIComponent(query)}`, { 
                headers: HEADERS, 
                timeout: 10000 
            });
            
            if (searchRes.data?.success && searchRes.data.tracks?.length > 0) {
                trackId = searchRes.data.tracks[0].id;
                trackMeta = searchRes.data.tracks[0];
            }
        } catch (err) {
            logger.warn(`[SPOTIFY] Search failed: ${err.message}`);
        }
    }

    if (!trackId) throw new Error('No results found on Spotify.');

    // 🚀 3. Track Download karo
    try {
        logger.info(`[SPOTIFY] Fetching download link for ID: ${trackId}`);
        const dlRes = await axios.get(`https://api.spotifydown.com/download/${trackId}`, { 
            headers: HEADERS, 
            timeout: 20000 
        });

        if (dlRes.data?.success && dlRes.data.link) {
            return {
                title: dlRes.data.metadata.title || trackMeta?.title || query,
                artist: dlRes.data.metadata.artists || trackMeta?.artists || 'Unknown',
                thumbnail: dlRes.data.metadata.cover || trackMeta?.cover || null,
                audioUrl: dlRes.data.link
            };
        }
        throw new Error('Download API failed to return link.');
    } catch (err) {
        logger.error(`[SPOTIFY] Download failed: ${err.message}`);
        throw new Error('Failed to download from Spotify. Try another song.');
    }
}
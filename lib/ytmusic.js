/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎵 YTMUSIC.JS — Multi-API Audio Downloader (Buffer System)
 * ═══════════════════════════════════════════════════════════════════
 */

import axios from 'axios';
import logger from '../utils/logger.js';

const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB Limit

const safeFileName = (value) => {
    return String(value || 'audio').replace(/[^a-z0-9 _-]/gi, '').trim().slice(0, 100) || 'audio';
};

const fetchAudioBuffer = async (url) => {
    if (!/^https?:\/\//i.test(String(url || ''))) throw new Error('Invalid audio URL');
    
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 60000,
        maxContentLength: MAX_AUDIO_BYTES,
        maxRedirects: 6,
        headers: { 
            'User-Agent': 'Mozilla/5.0', 
            Accept: 'audio/mpeg,audio/*,application/octet-stream;q=0.8,*/*;q=0.5' 
        },
        validateStatus: () => true,
    });
    
    const buffer = Buffer.from(response.data || '');
    const contentType = String(response.headers?.['content-type'] || '').toLowerCase();
    
    if (response.status < 200 || response.status >= 300) throw new Error(`HTTP ${response.status}`);
    if (!buffer.length || contentType.includes('text/html') || contentType.includes('application/json')) {
        throw new Error('Invalid audio response');
    }
    
    const mimetype = contentType.includes('audio/') ? contentType.split(';')[0] : 'audio/mpeg';
    return { buffer, mimetype };
};

const fetchThumbnailBuffer = async (url) => {
    if (!/^https?:\/\//i.test(String(url || ''))) return null;
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 15000,
            maxContentLength: 5 * 1024 * 1024,
            headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'image/jpeg,image/*;q=0.8,*/*;q=0.5' },
            validateStatus: () => true,
        });
        const contentType = String(response.headers?.['content-type'] || '').toLowerCase();
        if (response.status >= 200 && response.status < 300 && contentType.includes('image/')) {
            return Buffer.from(response.data);
        }
    } catch (error) {
        logger.warn(`[PLAY] Thumbnail unavailable: ${error.message}`);
    }
    return null;
};

export async function downloadYouTubeAudio(query) {
    const strategies = [
        // Strategy 1: David Cyril Primary API
        async () => {
            const { data } = await axios.get(`https://apis.davidcyril.name.ng/play?query=${encodeURIComponent(query)}`, { timeout: 30000 });
            if (data.status && data.result?.download_url) {
                return {
                    url: data.result.download_url,
                    title: data.result.title,
                    thumbnail: data.result.thumbnail,
                    duration: data.result.duration,
                    author: data.result.author || data.result.artist || data.result.channel || 'YouTube'
                };
            }
            throw new Error('Primary API failed');
        },
        // Strategy 2: David Cyril Search + Download
        async () => {
            const searchRes = await axios.get(`https://apis.davidcyril.name.ng/youtube/search?query=${encodeURIComponent(query)}`, { timeout: 15000 });
            const video = searchRes.data?.results?.[0];
            if (!video?.url) throw new Error('Search failed');

            const dlRes = await axios.get(`https://apis.davidcyril.name.ng/download/ytmp3?url=${encodeURIComponent(video.url)}`, { timeout: 30000 });
            if (dlRes.data.success && dlRes.data.result?.download_url) {
                return {
                    url: dlRes.data.result.download_url,
                    title: video.title,
                    thumbnail: video.thumbnail,
                    duration: video.duration,
                    author: video.author || 'YouTube'
                };
            }
            throw new Error('Secondary API failed');
        },
        // Strategy 3: Agatz API
        async () => {
            const { data } = await axios.get(`https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(query)}`, { timeout: 30000 }).catch(() => ({ data: {} }));
            if (data.status === 200 && data.data?.downloadUrl) {
                return {
                    url: data.data.downloadUrl,
                    title: data.data.title || query,
                    thumbnail: data.data.thumbnail,
                    duration: data.data.duration,
                    author: data.data.author || 'YouTube'
                };
            }
            throw new Error('Agatz API failed');
        }
    ];

    let resultData = null;

    // APIs ko try karo
    for (const strategy of strategies) {
        try {
            const res = await strategy();
            if (res?.url) {
                resultData = res;
                break;
            }
        } catch (e) {
            logger.warn(`[PLAY] Strategy failed: ${e.message}`);
        }
    }

    if (!resultData) {
        throw new Error('All download APIs are down. Please try again later.');
    }

    // Download Audio & Thumbnail Buffers
    try {
        const downloadedAudio = await fetchAudioBuffer(resultData.url);
        const thumbnailBuffer = await fetchThumbnailBuffer(resultData.thumbnail);
        
        return {
            title: resultData.title || query,
            author: resultData.author || 'YouTube',
            duration: resultData.duration || 'Unknown',
            audioBuffer: downloadedAudio.buffer,
            mimetype: downloadedAudio.mimetype,
            thumbnailBuffer: thumbnailBuffer,
            fileName: `${safeFileName(resultData.title || query)}${downloadedAudio.mimetype.includes('mpeg') ? '.mp3' : '.audio'}`
        };
    } catch (err) {
        throw new Error(`Download failed: ${err.message}`);
    }
}
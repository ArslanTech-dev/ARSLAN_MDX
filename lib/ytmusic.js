import yts from 'yt-search';
import axios from 'axios';
import logger from '../utils/logger.js';
import pkg from '@kelvdra/scraper';
const { ytmp3, playmp3 } = pkg;

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

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
    let urlToDownload = query;
    let videoTitle = query;
    let videoAuthor = 'YouTube';
    let thumbnail = null;

    // 1. Search if query is not a URL
    if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
        try {
            const { videos } = await yts(query);
            if (videos && videos.length > 0) {
                urlToDownload = videos[0].url;
                videoTitle = videos[0].title;
                videoAuthor = videos[0].author.name;
                thumbnail = videos[0].thumbnail;
            }
        } catch (e) {
            logger.warn(`[PLAY] Search failed: ${e.message}`);
        }
    }

    let audioUrl = null;
    let mimetype = 'audio/mpeg';

    // 🚀 Method 1: Direct Scraper (@kelvdra/scraper)
    try {
        logger.info(`[PLAY] Downloading via Scraper: ${urlToDownload}`);
        const result = await ytmp3(urlToDownload, 'mp3');
        audioUrl = result.download?.url || result.url || result.dl;
        if (result.title) videoTitle = result.title;
        if (result.thumbnail) thumbnail = result.thumbnail;
    } catch (err) {
        logger.warn(`[PLAY] Scraper failed: ${err.message}. Trying Fallback API...`);
    }

    // 🚀 Method 2: Fallback API
    if (!audioUrl) {
        try {
            logger.info(`[PLAY] Downloading via Fallback API: ${urlToDownload}`);
            const apiRes = await axios.get(`https://apis.davidcyril.name.ng/play?query=${encodeURIComponent(urlToDownload)}`, { timeout: 30000 });
            if (apiRes.data?.status && apiRes.data?.result?.download_url) {
                audioUrl = apiRes.data.result.download_url;
                videoTitle = apiRes.data.result.title || videoTitle;
                videoAuthor = apiRes.data.result.author || videoAuthor;
                thumbnail = apiRes.data.result.thumbnail || thumbnail;
            }
        } catch (apiErr) {
            logger.error(`[PLAY] Fallback API failed: ${apiErr.message}`);
        }
    }

    if (!audioUrl) {
        throw new Error('All download methods failed. YouTube might be blocking this request.');
    }

    // 3. Download Audio to Buffer
    const downloadedAudio = await fetchAudioBuffer(audioUrl);
    const thumbnailBuffer = await fetchThumbnailBuffer(thumbnail);

    return {
        title: videoTitle,
        author: videoAuthor,
        duration: 'Unknown',
        audioBuffer: downloadedBuffer = downloadedAudio.buffer,
        mimetype: downloadedAudio.mimetype,
        thumbnailBuffer: thumbnailBuffer,
        fileName: `${safeFileName(videoTitle)}.mp3`
    };
}
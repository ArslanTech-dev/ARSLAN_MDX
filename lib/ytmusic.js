import yts from 'yt-search';
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import axios from 'axios';
import logger from '../utils/logger.js';

export async function downloadYouTubeAudio(query) {
    let videoUrl = query;
    let videoTitle = 'Unknown';
    let videoAuthor = 'YouTube';

    // Temp folder banao
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    // 1. Agar URL nahi hai toh search karo
    if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
        const { videos } = await yts(query);
        if (!videos || videos.length === 0) throw new Error('No results found.');
        videoUrl = videos[0].url;
        videoTitle = videos[0].title;
        videoAuthor = videos[0].author.name;
    }

    logger.info(`[YTMUSIC] Downloading: ${videoUrl}`);

    // 🚀 Method 1: Direct ytdl-core + FFmpeg (Sabse reliable)
    try {
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title || videoTitle;
        const author = info.videoDetails.author?.name || videoAuthor;
        const duration = info.videoDetails.lengthSeconds + 's';

        const fileName = `${randomBytes(4).toString('hex')}.mp3`;
        const filePath = path.join(tmpDir, fileName);

        return await new Promise((resolve, reject) => {
            const stream = ytdl(videoUrl, { 
                quality: 'highestaudio', 
                filter: 'audioonly',
                requestOptions: {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                }
            });

            ffmpeg(stream)
                .audioBitrate(128)
                .toFormat('mp3')
                .save(filePath)
                .on('end', () => {
                    resolve({
                        title: title,
                        author: author,
                        duration: duration,
                        views: info.videoDetails.viewCount || 'N/A',
                        filePath: filePath, // File path return ho raha hai
                        isUrl: false
                    });
                })
                .on('error', (err) => {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    reject(err);
                });
        });
    } catch (err) {
        logger.warn(`[YTMUSIC] ytdl-core blocked: ${err.message}. Switching to API...`);
    }

    // 🚀 Method 2: Izumi API Fallback
    try {
        const apiUrl = `https://izumiiiiiiii.dpdns.org/downloader/youtube?url=${encodeURIComponent(videoUrl)}&format=mp3`;
        const res = await axios.get(apiUrl, { timeout: 30000 });
        
        if (res?.data?.result?.download) {
            const result = res.data.result;
            return {
                title: result.title || videoTitle,
                author: videoAuthor,
                duration: result.duration || 'Unknown',
                views: 'N/A',
                audioUrl: result.download,
                isUrl: true
            };
        }
        throw new Error('Izumi returned no download link');
    } catch (err) {
        logger.warn(`[YTMUSIC] Izumi API failed: ${err.message}. Trying Okatsu...`);
    }
    
    // 🚀 Method 3: Okatsu API Fallback
    try {
        const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`;
        const res = await axios.get(apiUrl, { timeout: 30000 });
        
        if (res?.data?.dl) {
            return {
                title: res.data.title || videoTitle,
                author: videoAuthor,
                duration: res.data.duration || 'Unknown',
                views: 'N/A',
                audioUrl: res.data.dl,
                isUrl: true
            };
        }
        throw new Error('Okatsu returned no download link');
    } catch (err) {
        logger.error(`[YTMUSIC] All methods failed: ${err.message}`);
        throw new Error('YouTube is blocking downloads. Please try again later.');
    }
}